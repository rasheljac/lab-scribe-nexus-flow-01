
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from 'jspdf';

export const useEnhancedReports = () => {
  const { user } = useAuth();

  const generateComprehensiveReport = useMutation({
    mutationFn: async ({ 
      title, 
      experimentIds, 
      includeNotes = true, 
      includeAttachments = true 
    }: {
      title: string;
      experimentIds?: string[];
      includeNotes?: boolean;
      includeAttachments?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Fetch experiments data
      let experimentsQuery = supabase
        .from('experiments')
        .select('*')
        .eq('user_id', user.id);

      if (experimentIds && experimentIds.length > 0) {
        experimentsQuery = experimentsQuery.in('id', experimentIds);
      }

      const { data: experiments, error: experimentsError } = await experimentsQuery;
      if (experimentsError) throw experimentsError;

      // Fetch notes if requested
      let allNotes: any[] = [];
      if (includeNotes && experiments.length > 0) {
        const { data: notes, error: notesError } = await supabase
          .from('experiment_notes')
          .select('*')
          .in('experiment_id', experiments.map(e => e.id));
        
        if (notesError) throw notesError;
        allNotes = notes || [];
      }

      // Fetch attachments if requested
      let allAttachments: any[] = [];
      if (includeAttachments && experiments.length > 0) {
        const { data: attachments, error: attachmentsError } = await supabase
          .from('experiment_attachments')
          .select('*')
          .in('experiment_id', experiments.map(e => e.id));
        
        if (attachmentsError) throw attachmentsError;
        allAttachments = attachments || [];
      }

      // Generate PDF
      const pdf = new jsPDF();
      let yPosition = 20;

      // Add title
      pdf.setFontSize(20);
      pdf.text(title, 20, yPosition);
      yPosition += 20;

      // Add generation date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 20;

      // Add experiments data
      experiments.forEach((experiment) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.text(`Experiment: ${experiment.title}`, 20, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        pdf.text(`Description: ${experiment.description || 'N/A'}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Status: ${experiment.status}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Researcher: ${experiment.researcher}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Start Date: ${experiment.start_date}`, 20, yPosition);
        yPosition += 8;
        pdf.text(`Progress: ${experiment.progress}%`, 20, yPosition);
        yPosition += 15;

        // Add notes for this experiment
        const experimentNotes = allNotes.filter(note => note.experiment_id === experiment.id);
        if (experimentNotes.length > 0) {
          pdf.setFontSize(14);
          pdf.text('Notes:', 20, yPosition);
          yPosition += 8;

          experimentNotes.forEach(note => {
            pdf.setFontSize(12);
            pdf.text(`- ${note.title}`, 25, yPosition);
            yPosition += 6;
            if (note.content) {
              const content = note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '');
              pdf.text(`  ${content}`, 30, yPosition);
              yPosition += 6;
            }
          });
          yPosition += 10;
        }

        // Add attachments for this experiment
        const experimentAttachments = allAttachments.filter(att => att.experiment_id === experiment.id);
        if (experimentAttachments.length > 0) {
          pdf.setFontSize(14);
          pdf.text('Attachments:', 20, yPosition);
          yPosition += 8;

          experimentAttachments.forEach(attachment => {
            pdf.setFontSize(12);
            pdf.text(`- ${attachment.filename} (${attachment.file_type})`, 25, yPosition);
            yPosition += 6;
          });
          yPosition += 10;
        }

        yPosition += 10;
      });

      // Save the PDF
      const pdfBlob = pdf.output('blob');
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    },
  });

  return {
    generateComprehensiveReport,
  };
};
