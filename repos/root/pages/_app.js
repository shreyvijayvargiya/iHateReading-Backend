
import React from 'react';
import { MoralisProvider } from 'react-moralis';

const MyApp = ({ Component, pageProps }) => {

    const serverUrl = 'https://3ukukm6bohpk.usemoralis.com:2053/server';
    const appId = '45OuXCH5ZreVCXapGquXrfnb5bsTTH6V6ZbsUz92';

    return (
        <MoralisProvider appId={appId} serverUrl={serverUrl}>
            <Component {...pageProps} />
        </MoralisProvider>
    );
};
export default MyApp;
