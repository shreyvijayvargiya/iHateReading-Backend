export const dependencyMap = {
	frameworks: {
		"next.js": {
			description:
				"Create pages/ directory with SSR setup and next config file with sample code",
			sampleCode: {
				files: [
					{
						path: "pages/index.js",
						content: `
              export default function Home() {
                return <h1>Welcome to Next.js with SSR!</h1>;
              }
            `,
					},
				],
			},
		},
		"create-react-app": {
			description: "Generate src/ structure with React 18+",
			sampleCode: {
				files: [
					{
						path: "src/index.js",
						content: `
              import React from 'react';
              import ReactDOM from 'react-dom/client';
              import App from './App';
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(<App />);
            `,
					},
					{
						path: "src/App.js",
						content: `
              export default function App() {
                return <h1>Hello from Create React App!</h1>;
              }
            `,
					},
				],
			},
		},
		"vite.js": {
			description:
				"Generate a Vite (Vue 3) project with vite config file in the root directory(vite.config.js)",
			sampleCode: {
				files: [
					{
						path: "src/App.vue",
						content: `
              <template>
                <h1>Welcome to Vite with Vue.js</h1>
              </template>
              <script>
              export default {
                name: "App",
              };
              </script>
            `,
					},
				],
			},
		},
	},
	ui: {
		antd: {
			description: "Configure Ant Design in src/antd",
			sampleCode: {
				files: [
					{
						path: "src/App.js",
						content: `
              import { Button } from 'antd';
              import 'antd/dist/reset.css';
              export default function App() {
                return <Button type="primary">Hello Ant Design!</Button>;
              }
            `,
					},
				],
			},
		},
		"shadcn/ui": {
			description: "Add components/ with shadcn primitives",
			sampleCode: {
				files: [
					{
						path: "components/ui/Button.jsx",
						content: `
              export default function Button({ children }) {
                return <button className="shadcn-button">{children}</button>;
              }
            `,
					},
				],
			},
		},
		mui: {
			description: "Create theme/ directory with Material UI config",
			sampleCode: {
				files: [
					{
						path: "theme/index.js",
						content: `
              import { createTheme } from '@mui/material/styles';
              const theme = createTheme({});
              export default theme;
            `,
					},
				],
			},
		},
		antd: {
			description: "Configure Ant Design in src/antd",
			sampleCode: {
				files: [
					{
						path: "src/App.js",
						content: `
              import { Button } from 'antd';
              import 'antd/dist/reset.css';
              export default function App() {
                return <Button type="primary">Hello Ant Design!</Button>;
              }
            `,
					},
				],
			},
		},
	},
	styling: {
		tailwindcss: {
			description: "Generate tailwind.config.js + postcss.config.js",
			sampleCode: {
				files: [
					{
						path: "tailwind.config.js",
						content: `
              module.exports = {
                content: ['./src/**/*.{js,jsx,ts,tsx}'],
                theme: {
                  extend: {},
                },
                plugins: [],
              };
            `,
					},
				],
			},
		},
		"css-modules": {
			description: "Create styles/ directory with .module.css files",
			sampleCode: {
				files: [
					{
						path: "styles/Home.module.css",
						content: `
              .title {
                color: blue;
                font-size: 2rem;
              }
            `,
					},
				],
			},
		},
		"styled-components": {
			description: "Add theme provider and base styles",
			sampleCode: {
				files: [
					{
						path: "src/theme.js",
						content: `
              export const theme = {
                colors: {
                  primary: "#0070f3",
                },
              };
            `,
					},
					{
						path: "src/App.js",
						content: `
              import { ThemeProvider } from 'styled-components';
              import { theme } from './theme';
              export default function App() {
                return (
                  <ThemeProvider theme={theme}>
                    <h1>Hello Styled Components</h1>
                  </ThemeProvider>
                );
              }
            `,
					},
				],
			},
		},
	},
	statemanagement: {
		zustand: {
			description: "Create store/ with Zustand slices",
			sampleCode: {
				files: [
					{
						path: "src/store/useStore.js",
						content: `
              import create from 'zustand';
              const useStore = create((set) => ({
                count: 0,
                increment: () => set((state) => ({ count: state.count + 1 })),
              }));
              export default useStore;
            `,
					},
				],
			},
		},
		redux: {
			description: "Generate redux store with toolkit",
			sampleCode: {
				files: [
					{
						path: "src/store/index.js",
						content: `
              import { configureStore } from '@reduxjs/toolkit';
              import counterReducer from './counterSlice';
              const store = configureStore({
                reducer: { counter: counterReducer },
              });
              export default store;
            `,
					},
					{
						path: "src/store/counterSlice.js",
						content: `
              import { createSlice } from '@reduxjs/toolkit';
              export const counterSlice = createSlice({
                name: 'counter',
                initialState: { value: 0 },
                reducers: {
                  increment: (state) => { state.value += 1; },
                },
              });
              export const { increment } = counterSlice.actions;
              export default counterSlice.reducer;
            `,
					},
				],
			},
		},
	},
	payment: {
		stripe: {
			description: "Create api/stripe with webhook handlers",
			env: ["STRIPE_API_KEY"],
			sampleCode: {
				files: [
					{
						path: "api/stripe.js",
						content: `
              import Stripe from 'stripe';
              const stripe = new Stripe(process.env.STRIPE_API_KEY);
              export default stripe;
            `,
					},
				],
			},
		},
		paypal: {
			description: "Integrate PayPal payment processing",
			env: ["PAYPAL_CLIENT_ID", "PAYPAL_SECRET"],
			sampleCode: {
				files: [
					{
						path: "lib/payment/paypal.js",
						content: `
              import paypal from '@paypal/checkout-server-sdk';
              const environment = new paypal.core.SandboxEnvironment(
                process.env.PAYPAL_CLIENT_ID,
                process.env.PAYPAL_SECRET
              );
              const client = new paypal.core.PayPalHttpClient(environment);
              export default client;
            `,
					},
				],
			},
		},
		lemonsqueezy: {
			description: "Add LemonSqueezy client integration",
			env: ["LEMON_API_KEY"],
			sampleCode: {
				files: [
					{
						path: "lib/payment/lemonsqueezy.js",
						content: `
              import axios from 'axios';
              const client = axios.create({
                baseURL: 'https://api.lemonsqueezy.com/v1/',
                headers: { Authorization: \`Bearer \${process.env.LEMON_API_KEY}\` },
              });
              export default client;
            `,
					},
				],
			},
		},
	},
	cms: {
		sanity: {
			description: "Setup Sanity studio and schemas",
			env: ["SANITY_PROJECT_ID", "SANITY_DATASET"],
			sampleCode: {
				files: [
					{
						path: "sanity.config.js",
						content: `
              import { defineConfig } from 'sanity';
              export default defineConfig({
                projectId: process.env.SANITY_PROJECT_ID,
                dataset: process.env.SANITY_DATASET,
                plugins: [],
              });
            `,
					},
				],
			},
		},
		contentful: {
			description: "Setup Contentful client configuration",
			env: ["CONTENTFUL_SPACE_ID", "CONTENTFUL_ACCESS_TOKEN"],
			sampleCode: {
				files: [
					{
						path: "config/contentful.js",
						content: `
          import { createClient } from 'contentful';
          
          export const contentfulClient = createClient({
            space: process.env.CONTENTFUL_SPACE_ID,
            accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
            environment: 'master'
          });
        `,
					},
					{
						path: "lib/contentful.js",
						content: `
          import { contentfulClient } from '../config/contentful';
          
          export async function getEntries(contentType) {
            return await contentfulClient.getEntries({
              content_type: contentType,
              include: 2
            });
          }
        `,
					},
				],
			},
		},
	},
	database: {
		firebase: {
			description: "Initialize Firebase config in services/firebase",
			env: [
				"REACT_APP_FIREBASE_API_KEY",
				"REACT_APP_FIREBASE_AUTH_DOMAIN",
				"REACT_APP_FIREBASE_PROJECT_ID",
			],
			sampleCode: {
				files: [
					{
						path: "src/services/firebase.js",
						content: `
              import { initializeApp } from 'firebase/app';
              const firebaseConfig = {
                apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
                authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
              };
              const app = initializeApp(firebaseConfig);
              export default app;
            `,
					},
				],
			},
		},
		supabase: {
			description: "Create Supabase client and initialize with API keys",
			env: ["SUPABASE_URL", "SUPABASE_API_KEY"],
			sampleCode: {
				files: [
					{
						path: "lib/supabase.js",
						content: `
              import { createClient } from '@supabase/supabase-js';
              const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_API_KEY
              );
              export default supabase;
            `,
					},
				],
			},
		},
		appwrite: {
			description: "Setup Appwrite client and configuration",
			env: ["APPWRITE_ENDPOINT", "APPWRITE_PROJECT_ID"],
			sampleCode: {
				files: [
					{
						path: "lib/appwrite.js",
						content: `
              import { Client } from 'appwrite';
              const client = new Client()
                .setEndpoint(process.env.APPWRITE_ENDPOINT)
                .setProject(process.env.APPWRITE_PROJECT_ID);
              export default client;
            `,
					},
				],
			},
		},
	},
	emailing: {
		resend: {
			description: "Transactional email service with React components",
			env: ["RESEND_API_KEY"],
			sampleCode: {
				files: [
					{
						path: "lib/email/config.js",
						content: `
              import { Resend } from 'resend';
              export const resend = new Resend(process.env.RESEND_API_KEY);
            `,
					},
					{
						path: "components/EmailTemplate.jsx",
						content: `
              export const EmailTemplate = ({ name }) => (
                <div>
                  <h1>Welcome, {name}!</h1>
                  <p>Thanks for joining our service.</p>
                </div>
              )
            `,
					},
				],
			},
		},
		sendgrid: {
			description: "Email delivery service with template support",
			env: ["SENDGRID_API_KEY", "SENDGRID_FROM_EMAIL"],
			sampleCode: {
				files: [
					{
						path: "services/email.js",
						content: `
              import sgMail from '@sendgrid/mail';
              sgMail.setApiKey(process.env.SENDGRID_API_KEY);
              
              export const sendWelcomeEmail = (to) => {
                const msg = {
                  to,
                  from: process.env.SENDGRID_FROM_EMAIL,
                  subject: 'Welcome!',
                  text: 'Thanks for signing up!'
                };
                return sgMail.send(msg);
              }
            `,
					},
					{
						path: "emails/welcome-template.html",
						content: `
              <!DOCTYPE html>
              <html>
                <body>
                  <h1>Welcome {{name}}!</h1>
                  <p>We're excited to have you on board.</p>
                </body>
              </html>
            `,
					},
				],
			},
		},
	},
};
