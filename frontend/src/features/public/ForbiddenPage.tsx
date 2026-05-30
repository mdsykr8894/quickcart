import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody } from '../../components/Card';
import Button from '../../components/Button';

const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full text-center">
        <CardBody className="space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-3xl mx-auto">
            🚫
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">403 - Access Forbidden</h1>
            <p className="text-xs text-red-500 font-extrabold uppercase tracking-wider">
              INSUFFICIENT PERMISSIONS SHIELD
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              You do not possess the required credentials or administrative role permissions to access this specific module directory. This security event has been logged in the audit trail.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/">
              <Button className="w-full">Back to Home Front</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ForbiddenPage;
