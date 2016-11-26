﻿using System;
using System.Collections.Immutable;
using System.Linq;
using VocaDb.Model.Domain.Comments;
using VocaDb.Model.Domain.Discussions;
using VocaDb.Model.Domain.Songs;
using VocaDb.Model.Domain.Users;
using VocaDb.Model.Helpers;

namespace VocaDb.Model.Domain.Security {

	using StatusSet = ImmutableSortedSet<EntryStatus>;

	public static class EntryPermissionManager {

		private static StatusSet Set(params EntryStatus[] vals) {
			return ImmutableSortedSet.CreateRange(vals);
		}

		private static readonly ImmutableSortedSet<EntryStatus> allPermissions = Set(EnumVal<EntryStatus>.Values);

		// Entry statuses allowed for normal users
		private static readonly ImmutableSortedSet<EntryStatus> normalStatusPermissions = Set(EntryStatus.Draft, EntryStatus.Finished);

		// Entry statuses allowed for trusted users
		private static readonly ImmutableSortedSet<EntryStatus> trustedStatusPermissions = Set(EntryStatus.Draft, EntryStatus.Finished, EntryStatus.Approved);

		/* DIRECT OWNERSHIP:
		 * User is a direct owner of an entry if the user is marked as a verified owner of the entry. This only applies to artist entries.
		 * 
		 * TRANSITIVE OWNERSHIP:
		 * User is a transitive owner of an entry if the user is marked as verified owner of one of the artists credited for the album or song.
		 * Songs made using user's (UTAU) voicebanks do not count, only direct involvement in song making.
		 */

		/// <summary>
		/// Tests that the logged in user is directly verified as an owner of an artist entry.
		/// </summary>
		/// <param name="userContext">User context. Cannot be null.</param>
		/// <param name="entry">Entry to be checked. Can be null.</param>
		/// <returns>True if <paramref name="entry"/> is an artist entry and <paramref name="userContext"/> is a verified owner of that entry.</returns>
		private static bool IsDirectlyVerifiedFor(IUserPermissionContext userContext, IEntryBase entry) {
			
			return
				entry != null 
				&& entry.EntryType == EntryType.Artist
				&& userContext.IsLoggedIn 
				&& userContext.LoggedUser.VerifiedArtist 
				&& userContext.LoggedUser.OwnedArtistEntries.Any(a => a.Artist.Id == entry.Id);

		}

		/// <summary>
		/// Tests that the logged in user is a (transitive) verified owner of an entry.
		/// </summary>
		/// <param name="userContext">User context. Cannot be null.</param>
		/// <param name="entry">Entry to be checked. Can be null.</param>
		/// <returns>True if <paramref name="userContext"/> is the verified owner of <paramref name="entry"/>.</returns>
		/// <remarks>
		/// The user is considered to be the owner of the entry if the entry is an artist entry and the user is directly connected to that artist entry
		/// or if the entry is a song or album and the user is the owner of one of the artists for that song/album.
		/// </remarks>
		private static bool IsVerifiedFor(IUserPermissionContext userContext, IEntryBase entry) {

			if (entry == null || !userContext.IsLoggedIn || !userContext.LoggedUser.VerifiedArtist)
				return false;

			if (IsDirectlyVerifiedFor(userContext, entry))
				return true;

			var entryWithArtists = entry as IEntryWithArtists;
			return entryWithArtists != null && entryWithArtists.ArtistList.Any(a => !ArtistHelper.IsVoiceSynthesizer(a.ArtistType) && IsDirectlyVerifiedFor(userContext, a));

		}

		/// <summary>
		/// Gets a list of entry statuses that the user can edit or set.
		/// This means, the user is allowed to edit entries with any of these statuses, 
		/// and the user is able to change the entry status to any of these.
		/// </summary>
		/// <remarks>
		/// Most of the time the allowed entry statuses are global, but associating a user account with an artist entry
		/// gives special entry-specific permissions for the user editing that entry.
		/// </remarks>
		/// <param name="permissionContext">User permission context identifying the user's global permissions.</param>
		/// <param name="entry">Entry to be checked. Can be null. If null, only global permissions will be checked.</param>
		/// <returns>A list of permissions that can be set by the user.</returns>
		public static StatusSet AllowedEntryStatuses(IUserPermissionContext permissionContext, IEntryBase entry = null) {

			// Check for basic edit permissions, without these the user is limited or disabled
			if (!permissionContext.HasPermission(PermissionToken.ManageDatabase)) {
				return StatusSet.Empty;
			}

			// Moderators with lock permissions can edit everything
			if (permissionContext.HasPermission(PermissionToken.LockEntries))
				return allPermissions;

			// Trusted users can edit approved entries
			if (permissionContext.HasPermission(PermissionToken.ApproveEntries))
				return trustedStatusPermissions;

			// Verified artists get trusted permissions for their own entry
			if (IsDirectlyVerifiedFor(permissionContext, entry)) {				
				return trustedStatusPermissions;
			}

			// Normal user permissions
			if (permissionContext.HasPermission(PermissionToken.ManageDatabase))
				return normalStatusPermissions;

			return StatusSet.Empty;

		}

		public static bool CanDelete<TEntry>(IUserPermissionContext permissionContext, TEntry entry)
			where TEntry: IEntryWithVersions, IEntryWithStatus {
			
			if (!permissionContext.IsLoggedIn)
				return false;

			// Deleting requires edit permission
			if (!CanEdit(permissionContext, entry))
				return false;

			if (permissionContext.HasPermission(PermissionToken.DeleteEntries))
				return true;

			// Verified artists can delete their entries
			if (IsVerifiedFor(permissionContext, entry))
				return true;

			return entry.ArchivedVersionsManager.VersionsBase.All(v => v.Author != null && v.Author.Id == permissionContext.LoggedUserId);

		}

		public static bool CanEdit(IUserPermissionContext permissionContext, SongList songList) {

			if (songList.FeaturedList && CanManageFeaturedLists(permissionContext))
				return true;

			if (permissionContext.HasPermission(PermissionToken.EditAllSongLists))
				return true;

			return (songList.Author.IsTheSameUser(permissionContext.LoggedUser));

		}

		public static bool CanEdit(IUserPermissionContext permissionContext, Comment comment) {

			if (!permissionContext.HasPermission(PermissionToken.CreateComments))
				return false;

			if (permissionContext.HasPermission(PermissionToken.DeleteComments))
				return true;

			return (comment.Author != null && comment.Author.IsTheSameUser(permissionContext.LoggedUser));

		}

		public static bool CanEdit(IUserPermissionContext permissionContext, DiscussionTopic topic) {

			if (!permissionContext.HasPermission(PermissionToken.CreateComments))
				return false;

			if (permissionContext.HasPermission(PermissionToken.DeleteComments))
				return true;

			return (topic.Author != null && topic.Author.IsTheSameUser(permissionContext.LoggedUser));

		}

		/// <summary>
		/// Tests whether the user can edit a specific entry.
		/// The permission depends on both the user's global permissions and entry status.
		/// </summary>
		/// <param name="permissionContext">User permission context. Cannot be null.</param>
		/// <param name="entry">Entry to be checked. Cannot be null.</param>
		/// <returns>True if the user can edit the entry, otherwise false.</returns>
		public static bool CanEdit(IUserPermissionContext permissionContext, IEntryWithStatus entry) {

			ParamIs.NotNull(() => entry);

			return AllowedEntryStatuses(permissionContext, entry).Contains(entry.Status);

		}

		public static bool CanEditAdditionalPermissions(IUserPermissionContext permissionContext) {

			ParamIs.NotNull(() => permissionContext);

			return permissionContext.UserGroupId == UserGroupId.Admin;
		}

		public static bool CanEditGroupTo(IUserPermissionContext permissionContext, UserGroupId groupId) {

			ParamIs.NotNull(() => permissionContext);

			return permissionContext.UserGroupId == UserGroupId.Admin || permissionContext.UserGroupId > groupId;

		}

		public static bool CanEditUser(IUserPermissionContext permissionContext, UserGroupId groupId) {

			ParamIs.NotNull(() => permissionContext);

			return CanEditGroupTo(permissionContext, groupId);

		}

		public static bool CanManageFeaturedLists(IUserPermissionContext permissionContext) {

			return permissionContext.HasPermission(PermissionToken.EditFeaturedLists);

		}

		public static bool CanRemoveTagUsages(IUserPermissionContext permissionContext, IEntryBase entry) {

			if (!permissionContext.IsLoggedIn)
				return false;

			if (permissionContext.HasPermission(PermissionToken.RemoveTagUsages))
				return true;

			return IsVerifiedFor(permissionContext, entry);

		}

		public static void VerifyAccess<T>(IUserPermissionContext permissionContext, T entry, Func<IUserPermissionContext, T, bool> accessCheck) where T : class {

			ParamIs.NotNull(() => entry);

			if (!accessCheck(permissionContext, entry))
				throw new NotAllowedException();

		}

		public static void VerifyDelete<TEntry>(IUserPermissionContext permissionContext, TEntry entry)
			where TEntry: class, IEntryWithVersions, IEntryWithStatus {

			VerifyAccess(permissionContext, entry, CanDelete);

		}

		public static void VerifyEdit(IUserPermissionContext permissionContext, SongList entry) {

			VerifyAccess(permissionContext, entry, CanEdit);

		}

		public static void VerifyEdit(IUserPermissionContext permissionContext, IEntryWithStatus entry) {

			VerifyAccess(permissionContext, entry, CanEdit);

		}

	}
}
