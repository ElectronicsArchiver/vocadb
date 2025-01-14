import AppRoutes from '@/AppRoutes';
import Container from '@/Bootstrap/Container';
import { AboutDisclaimer } from '@/Components/Shared/Partials/AboutDisclaimer';
import { Header } from '@/Components/Shared/Partials/Header';
import { LeftMenu } from '@/Components/Shared/Partials/LeftMenu';
import { miniPlayerHeight, VdbPlayer } from '@/Components/VdbPlayer/VdbPlayer';
import { ScrollToTop } from '@vocadb/route-sphere';
import React from 'react';
import { Toaster } from 'react-hot-toast';

const App = (): React.ReactElement => {
	return (
		<>
			<ScrollToTop />

			<Header />

			<div css={{ display: 'flex' }}>
				<LeftMenu />

				<Container
					fluid
					css={{ flex: '1 1 100%', paddingBottom: miniPlayerHeight }}
				>
					<div className="row-fluid">
						<div className="span12 rightFrame well">
							<React.Suspense fallback={null /* TODO */}>
								<AppRoutes />
							</React.Suspense>
						</div>

						<AboutDisclaimer />
					</div>
				</Container>
			</div>

			<Toaster containerStyle={{ top: '10vh' }} gutter={0} />

			<VdbPlayer />
		</>
	);
};

export default App;
