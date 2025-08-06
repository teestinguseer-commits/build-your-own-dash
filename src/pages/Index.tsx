import { useState } from "react";
import UseCasesPage from "@/components/UseCasesPage";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [showAdminView, setShowAdminView] = useState(false);
  const { user } = useAuth();

  const handleToggleAdminView = () => {
    setShowAdminView(!showAdminView);
  };

  return (
    <UseCasesPage 
      showAdminView={user ? showAdminView : false}
      onToggleAdminView={user ? handleToggleAdminView : undefined}
    />
  );
};

export default Index;
