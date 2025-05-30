
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from 'jspdf';

export const useProjectExperimentReports = () => {
  const { user } = useAuth();

  const generateProjectReport = useMutation({
    mutationFn: async ({ 
      projectId, 
      projectTitle,
      includeNotes = true, 
      includeAttachments = true 
    }: {
      projectId: string;
      projectTitle: string;
      includeNotes?: boolean;
      includeAttachments?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Fetch project data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) throw projectError;

      // Fetch experiments for this project
      const { data: experiments, error: experimentsError } = await supabase
        .from('experiments')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (experimentsError) throw experimentsError;

      // Fetch notes for all experiments in this project
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

      return generatePDF({
        title: `Project Report: ${projectTitle}`,
        project,
        experiments: experiments || [],
        notes: allNotes,
        attachments: allAttachments,
        user
      });
    },
  });

  const generateExperimentReport = useMutation({
    mutationFn: async ({ 
      experimentId, 
      experimentTitle,
      includeNotes = true, 
      includeAttachments = true 
    }: {
      experimentId: string;
      experimentTitle: string;
      includeNotes?: boolean;
      includeAttachments?: boolean;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Fetch experiment data
      const { data: experiment, error: experimentError } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', experimentId)
        .eq('user_id', user.id)
        .single();

      if (experimentError) throw experimentError;

      // Fetch notes for this experiment
      let notes: any[] = [];
      if (includeNotes) {
        const { data: notesData, error: notesError } = await supabase
          .from('experiment_notes')
          .select('*')
          .eq('experiment_id', experimentId);
        
        if (notesError) throw notesError;
        notes = notesData || [];
      }

      // Fetch attachments if requested
      let attachments: any[] = [];
      if (includeAttachments) {
        const { data: attachmentsData, error: attachmentsError } = await supabase
          .from('experiment_attachments')
          .select('*')
          .eq('experiment_id', experimentId);
        
        if (attachmentsError) throw attachmentsError;
        attachments = attachmentsData || [];
      }

      return generatePDF({
        title: `Experiment Report: ${experimentTitle}`,
        experiments: [experiment],
        notes,
        attachments,
        user
      });
    },
  });

  const addLogoToPDF = (pdf: jsPDF) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Add logo to top right corner - resize to fit nicely
          const logoWidth = 40;
          const logoHeight = 40;
          const margin = 20;
          const pageWidth = pdf.internal.pageSize.width;
          
          pdf.addImage(img, 'PNG', pageWidth - margin - logoWidth, 10, logoWidth, logoHeight);
          resolve();
        } catch (error) {
          console.warn('Could not add logo to PDF:', error);
          resolve();
        }
      };
      img.onerror = () => {
        console.warn('Could not load logo image');
        resolve();
      };
      img.src = '/lovable-uploads/305ae0c2-f9ba-42cc-817b-eda518f05406.png';
    });
  };

  const generatePDF = async ({ title, project, experiments, notes, attachments, user }: any) => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = 20;

    // Add logo first
    await addLogoToPDF(pdf);

    // Set consistent font
    pdf.setFont('helvetica', 'normal');

    // Add header with consistent styling
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('KAPELCZAK LABORATORY', margin, yPosition);
    yPosition += 10;
    
    // Add a line under the header
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 20;

    // Add title with consistent font
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(title, contentWidth);
    pdf.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 8 + 10;

    // Add generation info with consistent styling
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const exportTime = new Date().toLocaleString();
    pdf.text(`Generated on: ${exportTime}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Generated by: ${user.email}`, margin, yPosition);
    yPosition += 20;

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
        return true;
      }
      return false;
    };

    // Helper function to add wrapped text
    const addWrappedText = (text: string, fontSize: number, fontStyle: string = 'normal', extraSpacing: number = 0) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      const lines = pdf.splitTextToSize(text, contentWidth);
      
      lines.forEach((line: string, index: number) => {
        checkPageBreak(fontSize * 0.5 + 5);
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.5 + 3; // Consistent line spacing
      });
      yPosition += extraSpacing;
    };

    // Add project info if available
    if (project) {
      checkPageBreak(80);

      addWrappedText(`Project: ${project.title}`, 14, 'bold', 8);

      if (project.description) {
        const cleanDescription = project.description.replace(/<[^>]*>/g, '').trim();
        if (cleanDescription) {
          addWrappedText(`Description: ${cleanDescription}`, 10, 'normal', 5);
        }
      }

      addWrappedText(`Status: ${project.status}`, 10, 'normal', 3);
      addWrappedText(`Progress: ${project.progress}%`, 10, 'normal', 3);
      addWrappedText(`Start Date: ${project.start_date}`, 10, 'normal', 3);
      
      if (project.end_date) {
        addWrappedText(`End Date: ${project.end_date}`, 10, 'normal', 3);
      }
      if (project.budget) {
        addWrappedText(`Budget: ${project.budget}`, 10, 'normal', 3);
      }
      yPosition += 15;
    }

    // Add experiments data
    experiments.forEach((experiment: any) => {
      checkPageBreak(100);

      addWrappedText(`Experiment: ${experiment.title}`, 14, 'bold', 8);

      if (experiment.description) {
        const cleanDescription = experiment.description.replace(/<[^>]*>/g, '').trim();
        if (cleanDescription) {
          addWrappedText(`Description: ${cleanDescription}`, 10, 'normal', 5);
        }
      }

      addWrappedText(`Status: ${experiment.status}`, 10, 'normal', 3);
      addWrappedText(`Researcher: ${experiment.researcher}`, 10, 'normal', 3);
      addWrappedText(`Start Date: ${experiment.start_date}`, 10, 'normal', 3);
      addWrappedText(`Progress: ${experiment.progress}%`, 10, 'normal', 10);

      // Add notes for this experiment
      const experimentNotes = notes.filter((note: any) => note.experiment_id === experiment.id);
      if (experimentNotes.length > 0) {
        checkPageBreak(60);

        addWrappedText('Notes:', 12, 'bold', 8);

        experimentNotes.forEach((note: any) => {
          checkPageBreak(40);

          addWrappedText(`• ${note.title}`, 10, 'bold', 5);
          
          if (note.content) {
            const cleanContent = note.content.replace(/<[^>]*>/g, '').trim();
            if (cleanContent) {
              const contentPreview = cleanContent.substring(0, 500);
              const displayContent = `  ${contentPreview}${cleanContent.length > 500 ? '...' : ''}`;
              addWrappedText(displayContent, 9, 'normal', 8);
            }
          }
        });
        yPosition += 10;
      }

      // Add attachments for this experiment
      const experimentAttachments = attachments.filter((att: any) => att.experiment_id === experiment.id);
      if (experimentAttachments.length > 0) {
        checkPageBreak(40);

        addWrappedText('Attachments:', 12, 'bold', 8);

        experimentAttachments.forEach((attachment: any) => {
          checkPageBreak(15);
          addWrappedText(`• ${attachment.filename} (${attachment.file_type})`, 10, 'normal', 3);
        });
        yPosition += 10;
      }

      yPosition += 15;
    });

    // Add footer to all pages with consistent styling
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('© Kapelczak Laboratory - Confidential', margin, pageHeight - 10);
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);
    }

    // Save the PDF
    const pdfBlob = pdf.output('blob');
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = project 
      ? `Project_${project.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      : `Experiment_${experiments[0]?.title?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  };

  return {
    generateProjectReport,
    generateExperimentReport,
  };
};
