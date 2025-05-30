import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export const useProjectExperimentReports = () => {
  const { user } = useAuth();

  const generateProjectReport = useMutation({
    mutationFn: async ({ 
      projectId, 
      projectTitle,
      reportTitle = "KAPELCZAK LABORATORY",
      includeNotes = true, 
      includeAttachments = true 
    }: {
      projectId: string;
      projectTitle: string;
      reportTitle?: string;
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

      const pdfResult = await generatePDF({
        title: `Project Report: ${projectTitle}`,
        reportTitle,
        project,
        experiments: experiments || [],
        notes: allNotes,
        attachments: allAttachments,
        user
      });

      // Save the report to the database
      await saveReportToDatabase({
        title: `Project Report: ${projectTitle}`,
        description: `Comprehensive report for project: ${projectTitle}`,
        type: 'experiment' as const,
        author: user.email || 'Unknown',
        user_id: user.id
      });

      return pdfResult;
    },
  });

  const generateExperimentReport = useMutation({
    mutationFn: async ({ 
      experimentId, 
      experimentTitle,
      reportTitle = "KAPELCZAK LABORATORY",
      includeNotes = true, 
      includeAttachments = true 
    }: {
      experimentId: string;
      experimentTitle: string;
      reportTitle?: string;
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

      const pdfResult = await generatePDF({
        title: `Experiment Report: ${experimentTitle}`,
        reportTitle,
        experiments: [experiment],
        notes,
        attachments,
        user
      });

      // Save the report to the database
      await saveReportToDatabase({
        title: `Experiment Report: ${experimentTitle}`,
        description: `Comprehensive report for experiment: ${experimentTitle}`,
        type: 'experiment' as const,
        author: user.email || 'Unknown',
        user_id: user.id
      });

      return pdfResult;
    },
  });

  const saveReportToDatabase = async (reportData: {
    title: string;
    description: string;
    type: 'experiment' | 'activity' | 'maintenance' | 'inventory';
    author: string;
    user_id: string;
  }) => {
    const { error } = await supabase
      .from('reports')
      .insert([{
        ...reportData,
        status: 'published',
        format: 'PDF',
        downloads: 1 // Start with 1 since it was just generated
      }]);

    if (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  };

  // Helper function to convert HTML to plain text while preserving formatting
  const htmlToFormattedText = (html: string): string => {
    if (!html) return '';
    
    // Remove HTML tags but preserve line breaks and basic formatting
    let text = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<\/ol>/gi, '\n')
      .replace(/<ol[^>]*>/gi, '')
      .replace(/<strong[^>]*>|<\/strong>/gi, '')
      .replace(/<b[^>]*>|<\/b>/gi, '')
      .replace(/<em[^>]*>|<\/em>/gi, '')
      .replace(/<i[^>]*>|<\/i>/gi, '')
      .replace(/<u[^>]*>|<\/u>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Clean up extra whitespace and normalize line breaks
    text = text
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove triple+ line breaks
      .replace(/[ \t]+/g, ' ') // Normalize spaces
      .trim();
    
    return text;
  };

  const addLogoToPDF = (pdf: jsPDF) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Calculate aspect ratio and size for proper logo display
          const originalWidth = img.width;
          const originalHeight = img.height;
          const aspectRatio = originalWidth / originalHeight;
          
          // Set smaller maximum dimensions while maintaining aspect ratio
          const maxWidth = 20; // Further reduced from 30
          const maxHeight = 13; // Further reduced from 20
          
          let logoWidth, logoHeight;
          
          if (aspectRatio > maxWidth / maxHeight) {
            logoWidth = maxWidth;
            logoHeight = maxWidth / aspectRatio;
          } else {
            logoHeight = maxHeight;
            logoWidth = maxHeight * aspectRatio;
          }
          
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

  const addQRCodeToPDF = async (pdf: jsPDF, reportTitle: string, reportId: string) => {
    try {
      const qrData = `${window.location.origin}/reports/${reportId}`;
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 80,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      const qrSize = 20;
      const margin = 20;

      pdf.addImage(
        qrCodeDataURL, 
        'PNG', 
        pageWidth - margin - qrSize, 
        pageHeight - margin - qrSize, 
        qrSize, 
        qrSize
      );

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Scan for digital copy', pageWidth - margin - qrSize, pageHeight - margin + 5);
    } catch (error) {
      console.warn('Could not add QR code to PDF:', error);
    }
  };

  const generatePDF = async ({ title, reportTitle, project, experiments, notes, attachments, user }: any) => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = 20;

    // Add logo first
    await addLogoToPDF(pdf);

    // Set consistent font and character spacing
    pdf.setFont('helvetica', 'normal');
    pdf.setCharSpace(0); // Reset character spacing

    // Add header with consistent styling using custom report title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setCharSpace(0);
    pdf.text(reportTitle || 'KAPELCZAK LABORATORY', margin, yPosition);
    yPosition += 10;
    
    // Add a line under the header
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 20;

    // Add title with consistent font
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setCharSpace(0);
    const titleLines = pdf.splitTextToSize(title, contentWidth);
    titleLines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += 8;
    });
    yPosition += 10;

    // Add generation info with consistent styling
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setCharSpace(0);
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

    // Helper function to add wrapped text with proper spacing
    const addWrappedText = (text: string, fontSize: number, fontStyle: string = 'normal', extraSpacing: number = 0) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', fontStyle);
      pdf.setCharSpace(0); // Ensure consistent character spacing
      
      // Clean the text and handle special characters
      const cleanText = text.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, ' ').trim();
      
      // Split text to fit within content width with proper margin
      const lines = pdf.splitTextToSize(cleanText, contentWidth - 10); // Extra margin for safety
      
      lines.forEach((line: string) => {
        checkPageBreak(fontSize * 0.6 + 5);
        pdf.text(line.trim(), margin, yPosition);
        yPosition += fontSize * 0.6 + 2; // Consistent line height
      });
      yPosition += extraSpacing;
    };

    // Add project info if available
    if (project) {
      checkPageBreak(80);

      addWrappedText(`Project: ${project.title}`, 14, 'bold', 8);

      if (project.description) {
        const cleanDescription = htmlToFormattedText(project.description);
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
        const cleanDescription = htmlToFormattedText(experiment.description);
        if (cleanDescription) {
          addWrappedText(`Description: ${cleanDescription}`, 10, 'normal', 5);
        }
      }

      addWrappedText(`Status: ${experiment.status}`, 10, 'normal', 3);
      addWrappedText(`Researcher: ${experiment.researcher}`, 10, 'normal', 3);
      addWrappedText(`Start Date: ${experiment.start_date}`, 10, 'normal', 3);
      addWrappedText(`Progress: ${experiment.progress}%`, 10, 'normal', 10);

      // Add notes for this experiment with proper rich text rendering
      const experimentNotes = notes.filter((note: any) => note.experiment_id === experiment.id);
      if (experimentNotes.length > 0) {
        checkPageBreak(60);

        addWrappedText('Notes:', 12, 'bold', 8);

        experimentNotes.forEach((note: any) => {
          checkPageBreak(40);

          addWrappedText(`• ${note.title}`, 10, 'bold', 5);
          
          if (note.content) {
            // Convert HTML content to formatted text that preserves structure
            const formattedContent = htmlToFormattedText(note.content);
            if (formattedContent) {
              // Split content into manageable chunks while preserving formatting
              const contentLines = formattedContent.split('\n');
              contentLines.forEach((line, index) => {
                if (line.trim()) {
                  const indentedLine = `  ${line.trim()}`;
                  addWrappedText(indentedLine, 9, 'normal', index === contentLines.length - 1 ? 8 : 2);
                } else if (index < contentLines.length - 1) {
                  yPosition += 4; // Add space for empty lines
                }
              });
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

    // Add QR code to the last page
    const reportId = crypto.randomUUID();
    await addQRCodeToPDF(pdf, title, reportId);

    // Add footer to all pages with consistent styling
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setCharSpace(0);
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
