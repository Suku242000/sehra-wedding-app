import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { PublicRoute } from '@/lib/auth';
import Layout from '@/components/Layout';

const AuthPage: React.FC = () => {
  return (
    <PublicRoute>
      <Layout>
        <AuthForm />
      </Layout>
    </PublicRoute>
  );
};

export default AuthPage;
