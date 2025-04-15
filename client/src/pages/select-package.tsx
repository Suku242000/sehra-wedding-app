import React from 'react';
import PackageSelection from '@/components/auth/PackageSelection';
import { ProtectedRoute } from '@/lib/auth';
import Layout from '@/components/Layout';

const SelectPackagePage: React.FC = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <PackageSelection />
      </Layout>
    </ProtectedRoute>
  );
};

export default SelectPackagePage;
