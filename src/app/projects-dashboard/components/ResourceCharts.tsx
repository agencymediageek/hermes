'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const ResourceChartsInner = dynamic(() => import('./ResourceChartsInner'), { ssr: false });

export default function ResourceCharts() {
  return <ResourceChartsInner />;
}