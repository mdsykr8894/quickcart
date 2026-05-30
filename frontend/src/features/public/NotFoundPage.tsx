import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody } from '../../components/Card';
import Button from '../../components/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full text-center">
        <CardBody className="space-y-6">
          <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold text-3xl mx-auto">
            🔍
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900">404 - Page Not Found</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              We could not find the page you are looking for. It may have been relocated, deleted, or entered incorrectly.
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

export default NotFoundPage;
