// Custom hook for project data management
import { useState, useEffect } from 'react';
import { where } from 'firebase/firestore';
import { fetchCollection, queryCollection } from '../../lib/utils/firebaseHelpers';

export function useProjectData(projectIdOrSlug, useSlug = false) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let found;
      if (useSlug) {
        const results = await queryCollection("projects", where("slug", "==", projectIdOrSlug));
        found = results.length > 0 ? results[0] : null;
      } else {
        const projects = await fetchCollection("projects");
        found = projects.find(project => project.id === projectIdOrSlug);
      }
      
      if (found) {
        // Format date for HTML input if needed
        if (found.estimateDate) {
          let formattedDate = "";
          try {
            if (found.estimateDate.seconds) {
              formattedDate = new Date(found.estimateDate.seconds * 1000).toISOString().split('T')[0];
            } else if (typeof found.estimateDate === 'string') {
              formattedDate = new Date(found.estimateDate).toISOString().split('T')[0];
            } else if (found.estimateDate instanceof Date) {
              formattedDate = found.estimateDate.toISOString().split('T')[0];
            }
            found.formattedEstimateDate = formattedDate;
          } catch (err) {
            console.warn("Date formatting error:", err);
          }
        }
        setProject(found);
      } else {
        setError("Project not found");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error loading project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectIdOrSlug) {
      loadProject();
    }
  }, [projectIdOrSlug, useSlug]);

  return {
    project,
    setProject,
    loading,
    error,
    refetch: loadProject
  };
}
