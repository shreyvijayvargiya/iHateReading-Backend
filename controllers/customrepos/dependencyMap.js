export const dependencyMap = {
	frameworks: {
		"next.js": {
			instructions: `
        Generate a comprehensive Next.js 14 boilerplate with the following:
        1. Core dependencies: next, react, react-dom
        2. Basic project structure:
           - pages/ directory with SSR setup
           - public/ for static assets
           - src/ for components and utilities
        3. Essential configurations:
           - next.config.js with basic settings
           - .env template for environment variables
           - .eslintrc.json for linting
        4. Example files:
           - pages/index.js with a basic home page
           - pages/api/hello.js for API route example
           - src/components/Layout.jsx for shared layout
					 - pages/_app.js for wrapper 
        5. Documentation:
           - README.md with setup instructions
      `,
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
					{
						path: "next.config.js",
						content: `
							module.exports = () => {}
            `,
					},
				],
			},
		},
		"create-react-app": {
			instructions: `Generate a comprehensive Create React App boilerplate with the following:
        1. Core dependencies: react, react-dom, react-scripts
        2. Basic project structure:
          - src/ directory with components, App.js, and index.js
          - public/ for static assets
        3. Essential configurations:
          - .env for environment variables
          - .eslintrc.json for linting (if ESLint is enabled)
        4. Example files:
          - src/App.js with a basic component
          - src/index.js with ReactDOM rendering
        5. Documentation:
          - README.md with setup instructions
				`,
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
			instructions:
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
					{
						path: "vite.config.js",
						content: "",
					},
				],
			},
		},
	},
	ui: {
		antd: {
			instructions: `
				Integrate Ant Design with auto-dependency resolution:
				1. Retrieve the latest version of Ant Design.
				2. Install Ant Design.
				3. Ensure that "react" and "react-dom" are installed, as they are peer dependencies.
				4. Wrap the root component with corresponding config Provider.
			`,
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
			instructions: `
			  Integrate shadcn/ui with auto-dependency resolution:
        1. Find latest version of shadcn-ui CLI using:
           \`npm view shadcn-ui@latest version\`
        2. Initialize shadcn components with:
           \`npx shadcn-ui@latest init\` 
        3. Detect required peer dependencies from:
           https://ui.shadcn.com/docs/installation
        4. Install Radix UI primitives automatically:
           \`npm install @radix-ui/react-[component]\`
        5. Add tailwind.config.js modifications if missing
        6. Wrap root layout with <ThemeProvider>
			`,
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
			instructions: `
				Integrate Material-UI with auto-dependency resolution:
				1. Retrieve the latest version of Material-UI core.
				2. Install Material-UI core and its peer dependencies.
				3. (Optional) If icons are needed, install Material-UI icons.
				4. Wrap the root component with ThemeProvider.
			`,
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
		chakra: {
			instructions: `
				Integrate Chakra UI with auto-dependency resolution:
				1. Retrieve the latest version of Chakra UI.
				2. Install Chakra UI and its peer dependencies.
				3. Wrap the root component with ChakraProvider
			`,
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
			instructions: "Generate tailwind.config.js + postcss.config.js",
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
			instructions: "Create styles/ directory with .module.css files",
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
			instructions: "Add theme provider and base styles",
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
			instructions: `
				Integrate Zustand with auto-dependency resolution:
				1. Retrieve the latest version of Zustand:
					"npm view zustand@latest version"
				2. Install Zustand:
					"npm install zustand"
				3. Create a Zustand store to manage application state.
				4. Use the Zustand store within components to access and update state.
				5. For Next.js applications:
					- Ensure compatibility with server-side rendering by creating the store per request to prevent shared state between requests.
					- Avoid using the store in React Server Components; instead, use it in Client Components where hooks are supported.
			`,
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
			instructions: `
				Integrate Redux with auto-dependency resolution:
				1. Retrieve the latest version of Redux Toolkit:
					"npm view @reduxjs/toolkit@latest version"
				2. Install Redux Toolkit and React-Redux:
					"npm install @reduxjs/toolkit react-redux"
				3. Create a Redux store and configure it with reducers.
				4. Wrap the root component with <Provider> to make the store accessible:
					- For React.js: Wrap the <App /> component.
					- For Next.js: Wrap the custom <App /> component in "pages/_app.js" or "pages/_app.tsx".
				5. Use Redux hooks (useSelector, useDispatch) in components to interact with the store.
				6. For Next.js with server-side rendering, ensure proper store hydration to maintain state consistency between server and client.
			`,
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
			instructions: `
				Integrate Stripe payments with auto-dependency resolution:
				Retrieve the latest version of Stripe's React library.
				Install the required Stripe packages.
				Set up a Stripe account and obtain your API keys from the Stripe Dashboard.
				Configure the Stripe provider in your application to initialize Stripe.
				Create a payment form using Stripe Elements to securely collect payment details.
				Implement server-side logic to create payment intents and handle payment confirmations.
				Set up a webhook endpoint to listen for Stripe events (e.g., payment success, failure) and handle them appropriately.
				Ensure that your application securely handles sensitive payment information and complies with PCI DSS standards.
			`,
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
			instructions: `
				Integrate PayPal payments with auto-dependency resolution:
				1. Retrieve the latest version of PayPal's React SDK.
				2. Install the PayPal React SDK.
				3. Set up a PayPal Developer account and create a sandbox application to obtain your client ID.
				4. Configure the PayPal provider in your application using the client ID.
				5. Add PayPal buttons to your application to facilitate payments.
				6. Implement server-side logic to handle payment authorizations and captures.
				7. Set up a webhook endpoint to listen for PayPal events (e.g., payment completed, refunds) and handle them appropriately.
				8. Ensure that your application securely handles payment data and complies with PayPal's integration guidelines.
			`,
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
			instructions: "Add LemonSqueezy client integration",
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
			instructions: `
				Integrate Sanity CMS with auto-dependency resolution:
					1. Install the Sanity CLI globally.
					2. Initialize a new Sanity project within your application.
					3. Define the necessary schemas for your content types in the Sanity Studio.
					4. Deploy the Sanity Studio to manage content.
					5. Install the Sanity client in your application.
					6. Configure the Sanity client with your project ID and dataset.
					7. Fetch content from Sanity and render it within your React components.
					8. Ensure that your application handles content updates and errors gracefully.
			`,
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
			instructions: `
				Integrate Contentful CMS with auto-dependency resolution:
					1. Retrieve the latest version of the Contentful JavaScript SDK.
					2. Install the Contentful JavaScript SDK.
					3. Set up a Contentful account and create a new space.
					4. Within the Contentful space:
					5. Define the necessary content models.
					6. Add entries for each content model.
					7. Obtain the Space ID and Content Delivery API access token from the Contentful dashboard.
					8. Configure the Contentful client in your application using the obtained credentials.
					9. Fetch content from Contentful and render it within your React components.
					10. Ensure that your application handles content updates and errors gracefully
			`,
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
			instructions:
				"Initialize Firebase config in services/firebase. Provide a sample code to initialize Firebase app using the environment variables: REACT_APP_FIREBASE_API_KEY, REACT_APP_FIREBASE_AUTH_DOMAIN, REACT_APP_FIREBASE_PROJECT_ID. The code should include the process of setting up the Firebase app and exporting the instance.",
			env: [
				"REACT_APP_FIREBASE_API_KEY",
				"REACT_APP_FIREBASE_AUTH_DOMAIN",
				"REACT_APP_FIREBASE_PROJECT_ID",
			],
			sampleCode: {
				files: [
					{
						path: "src/services/firebase.js",
						content:
							"import { initializeApp } from 'firebase/app';\nconst firebaseConfig = {\n  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,\n  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,\n  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,\n};\nconst app = initializeApp(firebaseConfig);\nexport default app;",
					},
				],
			},
		},
		supabase: {
			instructions:
				"Create a Supabase client and initialize it with the API keys. Provide a sample code to initialize the Supabase client using the environment variables: SUPABASE_URL, SUPABASE_API_KEY. The code should include creating the client and exporting the instance.",
			env: ["SUPABASE_URL", "SUPABASE_API_KEY"],
			sampleCode: {
				files: [
					{
						path: "lib/supabase.js",
						content:
							"import { createClient } from '@supabase/supabase-js';\nconst supabase = createClient(\n  process.env.SUPABASE_URL,\n  process.env.SUPABASE_API_KEY\n);\nexport default supabase;",
					},
				],
			},
		},
		appwrite: {
			instructions:
				"Set up Appwrite client and configure it with the necessary endpoint and project ID. Provide a sample code to initialize the Appwrite client using the environment variables: APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID. The code should include creating the client instance and exporting it.",
			env: ["APPWRITE_ENDPOINT", "APPWRITE_PROJECT_ID"],
			sampleCode: {
				files: [
					{
						path: "lib/appwrite.js",
						content:
							"import { Client } from 'appwrite';\nconst client = new Client()\n  .setEndpoint(process.env.APPWRITE_ENDPOINT)\n  .setProject(process.env.APPWRITE_PROJECT_ID);\nexport default client;",
					},
				],
			},
		},
	},
	emailing: {
		resend: {
			instructions: `
				Integrate Resend for transactional emails:
					1. Install Resend SDK: \`npm install resend\`
					2. Create email templates in components/emails/
					3. Add Resend API key to .env or config env file
					4. Create API route for sending emails
					5. Wrap email components with React Email if needed
			`,
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
			instructions: `
				Integrate SendGrid for email delivery:
					1. Install SendGrid SDK: \`npm install @sendgrid/mail\`
					2. Add SendGrid API key and from email to .env or config files
					3. Create email templates in emails/
					4. Set up email service in lib/emails.js
			`,
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
