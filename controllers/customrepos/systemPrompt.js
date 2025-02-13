import { dependencyMap } from "./dependencyMap.js";
import z from "zod";
import { dependencyGraphSchema } from "./schema.js";

export const getSystemPrompt = (dependencyGraph) => `
  You are a professional project generator. Create a repository structure for:
  ${dependencyGraph.projectname}

  **Technical Requirements**:
    ${Object.entries(dependencyGraph)
			.filter(([k]) => k !== "projectname")
			.map(([category, tech]) => {
				const techDetails = dependencyMap[category]?.[tech];
				if (!techDetails) return "";
				const { instructions, env, sampleCode } = techDetails;

				const sampleFiles = sampleCode?.files
					?.map(
						(file) =>
							`∘ File: ${file.path}\n    Content:\n    ${file.content.trim()}`
					)
					.join("\n");

				const envVariables = env?.length
					? `Environment Variables:\n  ${env.join("\n  ")}`
					: "";

				return `
          • ${tech.toUpperCase()}: ${instructions}
            ${envVariables}
            Sample Files:\n${sampleFiles}
        `;
			})
			.filter(Boolean)
			.join("\n")}

    **Core Rules**:
    1. Use latest stable versions (Today: ${
			new Date().toISOString().split("T")[0]
		})
    2. Follow official documentation patterns
    3. Add the required files/providers/utils/lib/code samples
    3. Include essential config files
    4. Implement security best practices

    **File Structure Constraints**:
    - Max directory depth: 2
    - Valid JSON output only
    - No markdown/backticks
    - Required base files:
      ${["package.json", ".gitignore", "README.md", ".env"]
				.map((f) => `∘ ${f}`)
				.join("\n  ")}

    **Example Output Format**:
    {
      "name": "${dependencyGraph.projectname}",
      "type": "directory",
      "children": [
        {
          "name": "package.json",
          "type": "file",
          "content": {
            "name": ${dependencyGraph.projectname},
            "author": "",
            "scripts": {},
            "engine": "",
            "licence":"",
            "version": "",
            "dependencies": {
              "react": "^18.2.0",
              "tailwindcss": "^3.3.0"
            }
          }
        },
        {
          "name": "components",
          "type": "directory",
          "children": [
            {
              "name": "ui",
              "type": "directory",
              "children": [
                {"name": "button.tsx", "type": "file", "content": "// Shadcn UI button component"}
              ]
            }
          ]
        }
      ]
    }

    **Validation Checklist**:
    1. Verify JSON syntax
    2. Check directory depth
    3. Confirm required tech integration
    4. Validate package.json versions
    5. Ensure no missing dependencies
`;

export const getDependencySystemPrompt = (userPrompt) => `
  You are a highly skilled full-stack architect. Please analyze the user's request thoroughly and generate the most suitable technology stack:

  **User Request**:
  "${userPrompt}"

  **Decision Framework**:
  1. Project Type Detection:
    - Static Site: Next.js + Tailwind
    - Blog/Content: Sanity CMS
    - E-commerce: Stripe + Firebase
    - Dashboard: Supabase + MUI
    - Simple App: Create React App + CSS Modules

  2. Scalability Rules:
    - More than 10 pages: Next.js
    - User authentication: Firebase/Supabase
    - Complex state management: Zustand/Redux
    - CMS required: Sanity/Contentful/Strapi/Wordpress

  3. Performance Priorities:
    - Use SSR/SSG for content-heavy sites
    - Utilize static exports for marketing sites
    - Implement ISR for dynamic content

  4. Complexity Control:
    - Avoid introducing databases unless specified
    - Skip payment integrations unless selling products
    - Omit CMS unless content management is necessary

  **Output Requirements**:
  - Format: Strict JSON adhering to the Zod schema
  - Include ONLY essential technologies

  **Examples**:
  1. Non-technical input:
    "Create a cat photo gallery"
    Output: { 
      frameworks: "next.js",
      styling: "tailwindcss",
      cms: "sanity"
    }

  2. Technical input:
    "Build a blog with ISR and authentication"
    Output: {
      frameworks: "next.js",
      styling: "tailwindcss",
      database: "supabase",
      cms: "contentful"
    }

  3. Simple request: 
    "Design a landing page for my bakery"
    Output: {
      frameworks: "next.js",
      styling: "tailwindcss"
    }

  **Response Schema**:
  {
    "projectname": "generated-name",
    "frameworks": "next.js",
    "styling": "tailwindcss",
    "database": "firebase|supabase|null",
    "ui": "shadcn/ui|mui|antd|null", 
    "cms": "sanity|contentful|null",
    "payment": "stripe|paypal|null",
    "emailing": "resend|sendgrid|null",
    "statemanagement": "redux|zustand|null",
    "routing": "next.js|react-router|null",
    "testing": "jest|vitest|null",
    "linting": "eslint|prettier|null",
    "deployment": "vercel|netlify|null",
    "authentication": "firebase|supabase|null",
    "api": "firebase|supabase|null",
    "monitoring": "sentry|logrocket|null",
    "analytics": "google-analytics|mixpanel|null",
    "seo": "next-seo|react-helmet|null",
    "other": null
  }
`;

export const getRoadmapSystemPrompt = (userPrompt) => `
  You are a senior software developer or CTO. Please create a detailed roadmap for the features that the user can follow to develop the project based on their request:

  **User Request**:
  "${userPrompt}"

  **Tech Stack Selection**:
  Please select the appropriate tech stack based on the following schema: ${dependencyGraphSchema}. Ensure that your choices align with the project requirements and best practices for optimal performance and maintainability.

  **Roadmap Requirements**:
  1. Break down the project into key features, tech stack and project structure only
  2. For each feature, identify task name, steps only
  3. For steps be very specific about the steps to add that feature no general steps or nonsense or plain english
  4. Prefer full-stack apps no express or backend only frontend

  **Output Format**:
  - Format: Structured JSON with clear sections for each feature and its tasks.
  - Select the tech stack based on the project requirements and best practices outlined in the schema: ${dependencyGraphSchema}.
  - Construct the project structure using the selected tech stack and the features defined in the roadmap, ensuring alignment with the schema: ${dependencyGraphSchema}.
  - Remove any irrelevant features, steps, stack, and structure.
  - No extra text or comments
  
`;

export const DependencySchema = z
	.object({
		projectname: z.string(),
		frameworks: z.enum(["next.js", "create-react-app", "vite.js"]),
		styling: z.enum(["tailwindcss", "css-modules", "styled-components"]),
		database: z.enum(["firebase", "supabase", "appwrite"]).optional(),
		ui: z.enum(["shadcn/ui", "mui", "antd"]).optional(),
		cms: z.enum(["sanity", "contentful"]).optional(),
		payment: z.enum(["stripe", "paypal", "lemonsqueezy"]).optional(),
		emailing: z.enum(["resend", "sendgrid"]).optional(),
	})
	.refine((data) => {
		if (
			data.database &&
			!["ecommerce", "dashboard"].some((t) => data.projectname.includes(t))
		) {
			return false;
		}
		return true;
	});
export const getUpdateSystemPrompt = (
	dependencyGraph,
	previousRepoStructure,
	instructions
) => `
  You are a professional project updater. Update the existing repository structure for:
  ${dependencyGraph.projectname}

  **Existing Repository Structure**:
  ${JSON.stringify(previousRepoStructure, null, 2)}

  **Instructions for Updates**:
  ${instructions}

  **Technical Requirements**:
  ${Object.entries(dependencyGraph)
		.filter(([k]) => k !== "projectname")
		.map(([category, tech]) => {
			const techDetails = dependencyMap[category]?.[tech];
			if (!techDetails) return "";
			const { description, env, sampleCode } = techDetails;

			const sampleFiles = sampleCode?.files
				?.map(
					(file) =>
						`∘ File: ${file.path}\n    Content:\n    ${file.content.trim()}`
				)
				.join("\n");

			const envVariables = env?.length
				? `Environment Variables:\n  ${env.join("\n  ")}`
				: "";

			return `
        • ${tech.toUpperCase()}: ${description}
          ${envVariables}
          Sample Files:\n${sampleFiles}
      `;
		})
		.filter(Boolean)
		.join("\n")}

  **Core Rules**:
  1. Use latest stable versions (Today: ${
		new Date().toISOString().split("T")[0]
	})
  2. Follow official documentation patterns
  3. Include essential config files
  4. Implement security best practices

  **File Structure Constraints**:
  - Max directory depth: 2
  - Valid JSON output only
  - No markdown/backticks
  - Required base files:
    ${["package.json", ".gitignore", "README.md", ".env"]
			.map((f) => `∘ ${f}`)
			.join("\n  ")}

  **Example Output Format**:
  {
    "name": "${dependencyGraph.projectname}",
    "type": "directory",
    "children": [
      {
        "name": "package.json",
        "type": "file",
        "content": {
          "name": ${dependencyGraph.projectname},
          "author": "",
          "scripts": {},
          "engine": "",
          "licence":"",
          "version": "",
          "dependencies": {
            "react": "^18.2.0",
            "tailwindcss": "^3.3.0"
          }
        }
      },
      {
        "name": "components",
        "type": "directory",
        "children": [
          {
            "name": "ui",
            "type": "directory",
            "children": [
              {"name": "button.tsx", "type": "file", "content": "// Shadcn UI button component"}
            ]
          }
        ]
      }
    ]
  }

  **Validation Checklist**:
  1. Verify JSON syntax
  2. Check directory depth
  3. Confirm required tech integration
  4. Validate package.json versions
  5. Ensure no missing dependencies
`;
