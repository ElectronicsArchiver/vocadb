﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace ViewRes.Event
{
	using System;


	/// <summary>
	///   A strongly-typed resource class, for looking up localized strings, etc.
	/// </summary>
	// This class was auto-generated by the StronglyTypedResourceBuilder
	// class via a tool like ResGen or Visual Studio.
	// To add or remove a member, edit your .ResX file then rerun ResGen
	// with the /str option, or rebuild your VS project.
	[global::System.CodeDom.Compiler.GeneratedCodeAttribute("System.Resources.Tools.StronglyTypedResourceBuilder", "16.0.0.0")]
	[global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
	[global::System.Runtime.CompilerServices.CompilerGeneratedAttribute()]
	public class EventsBySeriesStrings
	{
		private static global::System.Resources.ResourceManager resourceMan;

		private static global::System.Globalization.CultureInfo resourceCulture;

		[global::System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1811:AvoidUncalledPrivateCode")]
		internal EventsBySeriesStrings()
		{
		}

		/// <summary>
		///   Returns the cached ResourceManager instance used by this class.
		/// </summary>
		[global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
		public static global::System.Resources.ResourceManager ResourceManager
		{
			get
			{
				if (object.ReferenceEquals(resourceMan, null))
				{
					global::System.Resources.ResourceManager temp = new global::System.Resources.ResourceManager("VocaDb.Web.Resources.Views.Event.EventsBySeriesStrings", typeof(EventsBySeriesStrings).Assembly);
					resourceMan = temp;
				}
				return resourceMan;
			}
		}

		/// <summary>
		///   Overrides the current thread's CurrentUICulture property for all
		///   resource lookups using this strongly typed resource class.
		/// </summary>
		[global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
		public static global::System.Globalization.CultureInfo Culture
		{
			get
			{
				return resourceCulture;
			}
			set
			{
				resourceCulture = value;
			}
		}

		/// <summary>
		///   Looks up a localized string similar to Create event.
		/// </summary>
		public static string CreateEvent
		{
			get
			{
				return ResourceManager.GetString("CreateEvent", resourceCulture);
			}
		}

		/// <summary>
		///   Looks up a localized string similar to Create series.
		/// </summary>
		public static string CreateSeries
		{
			get
			{
				return ResourceManager.GetString("CreateSeries", resourceCulture);
			}
		}

		/// <summary>
		///   Looks up a localized string similar to Create venue.
		/// </summary>
		public static string CreateVenue
		{
			get
			{
				return ResourceManager.GetString("CreateVenue", resourceCulture);
			}
		}

		/// <summary>
		///   Looks up a localized string similar to All by date.
		/// </summary>
		public static string ViewByDate
		{
			get
			{
				return ResourceManager.GetString("ViewByDate", resourceCulture);
			}
		}

		/// <summary>
		///   Looks up a localized string similar to All by series.
		/// </summary>
		public static string ViewBySeries
		{
			get
			{
				return ResourceManager.GetString("ViewBySeries", resourceCulture);
			}
		}

		/// <summary>
		///   Looks up a localized string similar to All by venue.
		/// </summary>
		public static string ViewByVenue
		{
			get
			{
				return ResourceManager.GetString("ViewByVenue", resourceCulture);
			}
		}

		/// <summary>
		///   Looks up a localized string similar to Upcoming.
		/// </summary>
		public static string ViewList
		{
			get
			{
				return ResourceManager.GetString("ViewList", resourceCulture);
			}
		}
	}
}