import { dependencyMap } from "./dependencyMap.js";
import z from "zod";

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
  You are an expert full-stack architect. Analyze the user's request and generate the optimal technology stack:

  **User Request**:
  "${userPrompt}"

  **Decision Framework**:
  1. Project Type Detection:
    - Static Site: Next.js + Tailwind
    - Blog/Content: + Sanity CMS
    - E-commerce: + Stripe + Firebase
    - Dashboard: + Supabase + MUI
    - Simple App: Create React App + CSS Modules

  2. Scalability Rules:
    - >10 pages: Next.js
    - User auth: Firebase/Supabase
    - Complex state: Zustand/Redux
    - CMS needed: Sanity/Contentful

  3. Performance Priorities:
    - SSR/SSG for content sites
    - Static exports for marketing sites
    - ISR for dynamic content

  4. Complexity Control:
    - Avoid databases unless mentioned
    - Skip payments unless selling
    - Omit CMS unless content management needed

  **Output Requirements**:
  - Format: Strict JSON matching Zod schema
  - Include ONLY necessary technologies
  - Add comments for non-obvious choices
  - Environment variables naming:
    - NEXT_PUBLIC_* for frontend
    - VITE_* for Vite projects
    - REACT_APP_* for CRA

  **Examples**:
  1. Non-technical input:
    "Make a cat photo gallery"
    Output: { 
      frameworks: "next.js",
      styling: "tailwindcss",
      cms: "sanity" 
    }

  2. Technical input:
    "Create a blog with ISR and auth"
    Output: {
      frameworks: "next.js",
      styling: "tailwindcss",
      database: "supabase",
      cms: "contentful"
    }

  3. Simple request: 
    "Landing page for my bakery"
    Output: {
      frameworks: "next.js",
      styling: "tailwindcss"
    }

  **Response Schema**:
  \`\`\`json
  {
    "projectname": "generated-name",
    "frameworks": "next.js",
    "styling": "tailwindcss",
    "database?:": "firebase|supabase|null",
    "ui?:": "shadcn/ui|mui|antd|null", 
    "cms?:": "sanity|contentful|null",
    "payment?:": "stripe|paypal|null"
  }
  \`\`\`

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
