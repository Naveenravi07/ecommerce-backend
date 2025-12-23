// This auth instance exported from this file is just a dummy instance 
// and used only for better auth code db schema code generation purpose.
// The actual better auth config is written in app.module.ts


import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
    database: drizzleAdapter({} as any,{
      provider: 'pg',
    }),
    socialProviders:{
      github:{
        clientId: '',
        clientSecret: '',
      },
      google:{
        clientId: '',
        clientSecret: '',
      },
    }
})