# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Environment Variables

This project requires the following environment variables for the New Relic Browser Agent. Create a `.env.local` file in the project root:

```
VITE_NEW_RELIC_APP_ID=your_app_id
VITE_NEW_RELIC_LICENSE_KEY=your_license_key
VITE_NEW_RELIC_ACCOUNT_ID=your_account_id
VITE_NEW_RELIC_AGENT_ID=your_agent_id
VITE_NEW_RELIC_TRUST_KEY=your_trust_key
```

| Variable | Where to find it |
|---|---|
| `VITE_NEW_RELIC_APP_ID` | New Relic > Browser > (your app) > Application settings |
| `VITE_NEW_RELIC_LICENSE_KEY` | New Relic > Browser > (your app) > Application settings |
| `VITE_NEW_RELIC_ACCOUNT_ID` | New Relic > (account dropdown) > Account settings |
| `VITE_NEW_RELIC_AGENT_ID` | New Relic > Browser > (your app) > Application settings |
| `VITE_NEW_RELIC_TRUST_KEY` | New Relic > (account dropdown) > Account settings |

## Environment Variables in AWS Amplify

To add environment variables to your Amplify deployment:

1. Open the [AWS Amplify Console](https://console.aws.amazon.com/amplify/) and select your app.
2. Go to **App settings** > **Environment variables**.
3. Click **Manage variables**, then **Add variable**.
4. Enter the key (must be prefixed with `VITE_` to be accessible in the app, e.g. `VITE_API_URL`) and the value.
5. Select which branches the variable applies to, then click **Save**.

Amplify will inject these variables at build time. Access them in your code via `import.meta.env.VITE_YOUR_VAR`.

> **Note:** Non-`VITE_`-prefixed variables are available during the build process only and are not exposed to the client bundle.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
