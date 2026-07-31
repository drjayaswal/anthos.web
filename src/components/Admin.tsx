'use client';

import { useState } from 'react';
import Loader from './Loader';
import AdminCategories from './AdminCategory';

export default function Admin() {
  const [appLoading, setAppLoading] = useState(false);

  if (appLoading) {
    return <Loader onComplete={() => setAppLoading(false)} />;
  }

  return (
    <div className="min-h-0 text-black">
      <main className="p-3 sm:p-8 lg:p-12">
        <AdminCategories />
      </main>
    </div>
  );
}
