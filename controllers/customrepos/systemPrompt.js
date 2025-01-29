import { dependencyMap } from "./dependencyMap.js";

export const getSystemPrompt = (dependencyGraph) => `
  You are a professional project generator. Create a repository structure for:
  ${dependencyGraph.projectname}

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
  1. Use latest stable versions (Today: ${new Date().toISOString().split("T")[0]})
  2. Follow official documentation patterns
  3. Include essential config files
  4. Implement security best practices

  **File Structure Constraints**:
  - Max directory depth: 2
  - Valid JSON output only
  - No markdown/backticks
  - Required base files:
    ${["package.json", ".gitignore", "README.md", ".env"].map((f) => `∘ ${f}`).join("\n  ")}

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
