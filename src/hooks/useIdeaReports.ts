
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useExperimentIdeas } from "@/hooks/useExperimentIdeas";
import { useIdeaNotes } from "@/hooks/useIdeaNotes";
import jsPDF from "jspdf";

export const useIdeaReports = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { ideas } = useExperimentIdeas();

  const generateIdeaReport = useMutation({
    mutationFn: async ({ ideaId, includeNotes = false }: { ideaId: string; includeNotes?: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      const idea = ideas.find(i => i.id === ideaId);
      if (!idea) throw new Error('Idea not found');

      // Get notes if requested
      let notes: any[] = [];
      if (includeNotes) {
        const { data: notesData, error: notesError } = await supabase
          .from('idea_notes')
          .select('*')
          .eq('idea_id', ideaId)
          .order('created_at', { ascending: false });

        if (notesError) throw notesError;
        notes = notesData || [];
      }

      // Generate PDF
      const pdf = new jsPDF();
      let yPosition = 20;

      // Title
      pdf.setFontSize(20);
      pdf.text(`Experiment Idea Report: ${idea.title}`, 20, yPosition);
      yPosition += 20;

      // Basic Info
      pdf.setFontSize(12);
      pdf.text(`Category: ${idea.category}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Status: ${idea.status}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Priority: ${idea.priority}`, 20, yPosition);
      yPosition += 10;
      pdf.text(`Created: ${new Date(idea.created_at).toLocaleDateString()}`, 20, yPosition);
      yPosition += 20;

      // Description
      if (idea.description) {
        pdf.setFontSize(14);
        pdf.text('Description:', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        const descriptionLines = pdf.splitTextToSize(idea.description, 170);
        pdf.text(descriptionLines, 20, yPosition);
        yPosition += descriptionLines.length * 5 + 10;
      }

      // Hypothesis
      if (idea.hypothesis) {
        pdf.setFontSize(14);
        pdf.text('Hypothesis:', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        const hypothesisLines = pdf.splitTextToSize(idea.hypothesis, 170);
        pdf.text(hypothesisLines, 20, yPosition);
        yPosition += hypothesisLines.length * 5 + 10;
      }

      // Methodology
      if (idea.methodology) {
        pdf.setFontSize(14);
        pdf.text('Methodology:', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        const methodologyLines = pdf.splitTextToSize(idea.methodology, 170);
        pdf.text(methodologyLines, 20, yPosition);
        yPosition += methodologyLines.length * 5 + 10;
      }

      // Required Materials
      if (idea.required_materials) {
        pdf.setFontSize(14);
        pdf.text('Required Materials:', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        const materialsLines = pdf.splitTextToSize(idea.required_materials, 170);
        pdf.text(materialsLines, 20, yPosition);
        yPosition += materialsLines.length * 5 + 10;
      }

      // Expected Outcomes
      if (idea.expected_outcomes) {
        pdf.setFontSize(14);
        pdf.text('Expected Outcomes:', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        const outcomesLines = pdf.splitTextToSize(idea.expected_outcomes, 170);
        pdf.text(outcomesLines, 20, yPosition);
        yPosition += outcomesLines.length * 5 + 10;
      }

      // Duration and Budget
      if (idea.estimated_duration || idea.budget_estimate) {
        pdf.setFontSize(14);
        pdf.text('Planning Details:', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        if (idea.estimated_duration) {
          pdf.text(`Estimated Duration: ${idea.estimated_duration}`, 20, yPosition);
          yPosition += 8;
        }
        if (idea.budget_estimate) {
          pdf.text(`Budget Estimate: ${idea.budget_estimate}`, 20, yPosition);
          yPosition += 8;
        }
        yPosition += 10;
      }

      // Tags
      if (idea.tags && idea.tags.length > 0) {
        pdf.setFontSize(14);
        pdf.text('Tags:', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.text(idea.tags.join(', '), 20, yPosition);
        yPosition += 20;
      }

      // Notes section
      if (includeNotes && notes.length > 0) {
        // Add new page for notes if needed
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.text('Research Notes:', 20, yPosition);
        yPosition += 15;

        notes.forEach((note, index) => {
          // Check if we need a new page
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(12);
          pdf.text(`${index + 1}. ${note.title}`, 20, yPosition);
          yPosition += 10;
          
          pdf.setFontSize(8);
          pdf.text(`Created: ${new Date(note.created_at).toLocaleDateString()}`, 20, yPosition);
          yPosition += 8;

          if (note.content) {
            pdf.setFontSize(10);
            // Strip HTML tags for PDF
            const plainTextContent = note.content.replace(/<[^>]*>/g, '');
            const contentLines = pdf.splitTextToSize(plainTextContent, 170);
            pdf.text(contentLines, 20, yPosition);
            yPosition += contentLines.length * 4 + 15;
          }
        });
      }

      // Save the report to database
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert([{
          user_id: user.id,
          title: `Experiment Idea Report: ${idea.title}`,
          description: `Generated report for experiment idea "${idea.title}"`,
          type: 'idea',
          status: 'published',
          author: user.email?.split('@')[0] || 'Unknown',
          format: 'PDF',
          size: '~' + Math.round(pdf.internal.pageSize.width * pdf.internal.pageSize.height / 1024) + 'KB'
        }])
        .select()
        .single();

      if (reportError) throw reportError;

      // Download the PDF
      pdf.save(`experiment-idea-${idea.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

      return reportData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const generateAllIdeasReport = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const pdf = new jsPDF();
      let yPosition = 20;

      // Title
      pdf.setFontSize(20);
      pdf.text('All Experiment Ideas Report', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 20;

      // Summary stats
      const statusCounts = ideas.reduce((acc: any, idea) => {
        acc[idea.status] = (acc[idea.status] || 0) + 1;
        return acc;
      }, {});

      const priorityCounts = ideas.reduce((acc: any, idea) => {
        acc[idea.priority] = (acc[idea.priority] || 0) + 1;
        return acc;
      }, {});

      pdf.setFontSize(14);
      pdf.text('Summary Statistics:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.text(`Total Ideas: ${ideas.length}`, 20, yPosition);
      yPosition += 8;
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        pdf.text(`${status}: ${count}`, 30, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
      pdf.text('Priority Distribution:', 20, yPosition);
      yPosition += 8;
      
      Object.entries(priorityCounts).forEach(([priority, count]) => {
        pdf.text(`${priority}: ${count}`, 30, yPosition);
        yPosition += 6;
      });

      yPosition += 20;

      // List all ideas
      pdf.setFontSize(14);
      pdf.text('All Ideas:', 20, yPosition);
      yPosition += 15;

      ideas.forEach((idea, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.text(`${index + 1}. ${idea.title}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(9);
        pdf.text(`Status: ${idea.status} | Priority: ${idea.priority} | Category: ${idea.category}`, 25, yPosition);
        yPosition += 6;
        
        if (idea.description) {
          const descLines = pdf.splitTextToSize(idea.description, 160);
          pdf.text(descLines.slice(0, 2), 25, yPosition); // Limit to 2 lines
          yPosition += Math.min(descLines.length, 2) * 4;
        }
        
        yPosition += 10;
      });

      // Save to database
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .insert([{
          user_id: user.id,
          title: 'All Experiment Ideas Report',
          description: `Generated comprehensive report for all ${ideas.length} experiment ideas`,
          type: 'idea',
          status: 'published',
          author: user.email?.split('@')[0] || 'Unknown',
          format: 'PDF',
          size: '~' + Math.round(pdf.internal.pageSize.width * pdf.internal.pageSize.height / 1024) + 'KB'
        }])
        .select()
        .single();

      if (reportError) throw reportError;

      pdf.save('all-experiment-ideas-report.pdf');
      return reportData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  return {
    generateIdeaReport,
    generateAllIdeasReport,
  };
};
