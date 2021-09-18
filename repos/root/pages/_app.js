
    import React from 'react';

    import { ThemeProvider } from '@material-ui/core/styles';



    const MyApp = ({ Component, pageProps }) => {

        return (

            <ThemeProvider>
                <Component {...pageProps} />
            </ThemeProvider>

        );

    };

    export default MyApp;

