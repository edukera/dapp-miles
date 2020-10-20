import React from 'react';
import './App.css';
import ticket from './img/takeoff-ticket.svg';
import { products, appTitle, appName, network } from './settings.js';
import HeaderBar from './components/HeaderBar';
import ConnectWallet from './components/ConnectWallet';
import Product from './components/Product';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Footer from './components/Footer';
import ViewMiles from './components/ViewMiles';
import { DAppProvider, useReady, useConnect } from './dapp';

function getProductStates (connected, nbActiveMiles) {
  console.log(connected);
  var states = [];
  products.forEach (product => {
    states[product.pid] = (connected && nbActiveMiles >= product.nbmiles)
  });
  return states;
}

function getNbActiveMiles(miles) {
  if (miles === null) {
    return null;
  };
  var total = 0;
  miles.forEach(mile => {
    total += mile.quantity;
  });
  return total;
}

function getNextExpirationDate (miles) {
  if (miles == null || miles.length === 0) {
    return null;
  }
  var next = new Date(8640000000000000);
  miles.forEach(mile => {
    var expiration = new Date(mile.expiration);
    if (expiration >= Date.now() && expiration <= next) {
      next = expiration;
    }
  });
  return next;
}

function App() {
  return (
    <DAppProvider appName={appName}>
      <React.Suspense fallback={null}>
        <PageRouter />
      </React.Suspense>
    </DAppProvider>
  );
}

function PageRouter() {
  const ready = useReady();
  const connect= useConnect();

  const handleConnect = React.useCallback(async () => {
    try {
      await connect(network);
    } catch (err) {
      alert(err.message);
    };
  }, [connect]);

  const [nbMiles, setNbMiles]       = React.useState(null);
  const [miles, setMiles]           = React.useState(null);
  const [nextExpiration, setNextExpiration] = React.useState(null);
  const [viewMiles, setViewMiles]   = React.useState(false);
  const productStates = getProductStates(ready,nbMiles);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  const openViewMiles = () => {
    setViewMiles(true);
  };

  const closeViewMiles = () => {
    setViewMiles(false);
  };

  const handleMiles = (m) => {
    setMiles(m);
    setNbMiles(getNbActiveMiles(m));
    setNextExpiration(getNextExpirationDate(m));
  }

  return (
    <div className="App">
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <HeaderBar appTitle={appTitle}/>
      <Container maxWidth="md" style={{
          backgroundImage : "url(" + ticket + ")",
          backgroundRepeat  : 'no-repeat',
          backgroundPosition: 'right 50% top 5%',}}>
        <ConnectWallet
          nbMiles={nbMiles}
          nextExpiration={nextExpiration}
          handleConnect={handleConnect}
          openViewMiles={openViewMiles}
          miles={miles}
          handleMiles={handleMiles} />
        <Grid container direction="row" spacing={2} style={{ marginBottom: 100 }}> {
            products.map(product =>
              <Grid item xs={4}>
                <Product
                  image={product.image}
                  title={product.title}
                  nbmiles={product.nbmiles}
                  state={productStates[product.pid]}
                  connected={ready}>
                </Product>
              </Grid>
            )}
        </Grid>
      </Container>
      <Footer></Footer>
      <ViewMiles open={viewMiles} onclose={closeViewMiles} theme={theme} miles={miles}/>
    </ThemeProvider>

    </div>
  );
}

export default App;
