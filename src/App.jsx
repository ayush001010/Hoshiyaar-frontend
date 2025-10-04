import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ReviewProvider } from './context/ReviewContext.jsx';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/layout/HomePage';
import Login from './components/forms/Login';
import Signup from './components/forms/Signup';
import LoadingPage from './components/ui/LoadingPage.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'; // Import the ProtectedRoute
import Learn from './components/Learn/pages/Learn.jsx'; // Import the new Learn component
import ReviewRound from './components/Learn/quiz/ReviewRound.jsx';
import RevisionList from './components/Learn/quiz/RevisionList.jsx';
import ConceptPage from './components/Learn/pages/ConceptPage.jsx';
import McqPage from './components/Learn/quiz/McqPage.jsx';
import FillupsPage from './components/Learn/quiz/FillupsPage.jsx';
import RearrangePage from './components/Learn/quiz/RearrangePage.jsx';
import ModuleEntryRedirect from './components/Learn/pages/ModuleEntryRedirect.jsx';
import LessonEntryRedirectByTitle from './components/Learn/pages/LessonEntryRedirectByTitle.jsx';
import ConceptIntro from './components/Learn/Concepts/ConceptIntro.jsx';
import ConceptImages2 from './components/Learn/Concepts/ConceptImages2.jsx';
import ConceptQuiz from './components/Learn/Concepts/ConceptQuiz.jsx';
import LessonComplete from './components/Learn/pages/LessonComplete.jsx';
import UploadTest from './components/features/UploadTest.jsx';
import ProfilePage from './components/features/ProfilePage.jsx';

const MainLayout = ({ children }) => (
  <div className="font-sans">
    <Header />
    <main>{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ReviewProvider>
        <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/loading" element={<LoadingPage />} />

          {/* Home Page Route */}
          <Route path="/" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />

          {/* Protected Learning Route */}
          <Route 
            path="/learn" 
            element={
              <ProtectedRoute>
                <Learn />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn/module/:moduleNumber" 
            element={
              <ProtectedRoute>
                <ModuleEntryRedirect />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn/module/:moduleNumber/lesson/:title" 
            element={
              <ProtectedRoute>
                <LessonEntryRedirectByTitle />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn/module/:moduleNumber/concept/:index" 
            element={
              <ProtectedRoute>
                <ConceptPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn/module/:moduleNumber/mcq/:index" 
            element={
              <ProtectedRoute>
                <McqPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn/module/:moduleNumber/fillups/:index" 
            element={
              <ProtectedRoute>
                <FillupsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn/module/:moduleNumber/rearrange/:index" 
            element={
              <ProtectedRoute>
                <RearrangePage />
              </ProtectedRoute>
            } 
          />
          {/* Concept demo flow (public for now) */}
          <Route path="/concept" element={<ConceptIntro />} />
          <Route path="/concept/step2" element={<ConceptImages2 />} />
          <Route path="/concept/quiz" element={<ConceptQuiz />} />
          <Route path="/lesson-complete" element={<LessonComplete />} />
          <Route path="/review-round" element={<ReviewRound />} />
          <Route path="/revision" element={<RevisionList />} />
            
          <Route path="/admin/upload-test" element={<UploadTest />} />
          
          {/* Handle direct access to index.html */}
          <Route path="/index.html" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
          
          {/* Catch-all route for SPA routing */}
          <Route path="*" element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          } />
        </Routes>
        </Router>
      </ReviewProvider>
    </AuthProvider>
  );
}

export default App;

