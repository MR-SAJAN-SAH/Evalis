import React from 'react';
import CreateExam from '../components/exam/CreateExam';
import '../styles/admin.css';

const CreateExamPage = () => {
  const handleClose = () => {
    window.history.back();
  };

  const handleSuccess = () => {
    window.location.href = '/admin/exams';
  };

  return (
    <div className="page-container">
      <CreateExam onClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
};

export default CreateExamPage;
