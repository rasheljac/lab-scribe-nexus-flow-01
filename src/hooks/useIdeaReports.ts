import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useExperimentIdeas } from "@/hooks/useExperimentIdeas";
import jsPDF from "jspdf";

export const useIdeaReports = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { ideas } = useExperimentIdeas();

  // Helper function to strip HTML and extract plain text
  const stripHtml = (html: string) => {
    if (!html) return '';
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Helper function to extract images from HTML content
  const extractImages = (html: string) => {
    if (!html) return [];
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const images = tmp.querySelectorAll('img');
    return Array.from(images).map(img => ({
      src: img.src,
      alt: img.alt || 'Image'
    }));
  };

  // Helper function to add Kapelczak logo to PDF
  const addKapelczakLogo = async (pdf: jsPDF, yPosition: number) => {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            const logoWidth = 15; // Reduced from 25
            const logoHeight = 15; // Reduced from 25
            const pageWidth = pdf.internal.pageSize.width;
            const logoX = pageWidth - logoWidth - 15;
            
            pdf.addImage(canvas.toDataURL(), 'PNG', logoX, yPosition, logoWidth, logoHeight);
            resolve(yPosition);
          } catch (error) {
            console.error('Error adding logo:', error);
            resolve(yPosition);
          }
        };
        img.onerror = () => {
          console.error('Error loading logo image');
          resolve(yPosition);
        };
        img.src = '/lovable-uploads/9ccbca6f-f337-4e9a-a4cf-3e27dc2b492c.png';
      });
    } catch (error) {
      console.error('Error in addKapelczakLogo:', error);
      return yPosition;
    }
  };

  // Helper function to add header with laboratory branding
  const addLabHeader = async (pdf: jsPDF, titleText: string = 'KAPELCZAK LABORATORY') => {
    let yPosition = 15;
    
    // Add logo
    await addKapelczakLogo(pdf, yPosition);
    
    // Laboratory name or idea title
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(titleText, 20, yPosition + 10);
    
    // Add line under header
    yPosition += 20;
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, pdf.internal.pageSize.width - 20, yPosition);
    
    return yPosition + 10;
  };

  const generateIdeaReport = useMutation({
    mutationFn: async ({ ideaId, includeNotes = false }: { ideaId: string; includeNotes?: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      const idea = ideas.find(i => i.id === ideaId);
      if (!idea) throw new Error('Idea not found');

      // Get notes if requested
      let notes: any[] = [];
      if (includeNotes) {
        try {
          const { data: notesData, error: notesError } = await supabase
            .from('idea_notes')
            .select('*')
            .eq('idea_id', ideaId)
            .order('created_at', { ascending: false });

          if (notesError) {
            console.error('Error fetching notes:', notesError);
          } else {
            notes = notesData || [];
          }
        } catch (error) {
          console.error('Error fetching notes:', error);
        }
      }

      // Generate PDF
      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const lineHeight = 6;
      let yPosition = await addLabHeader(pdf, idea.title); // Use idea title instead of default

      // Helper function to check if we need a new page
      const checkPageBreak = async (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = await addLabHeader(pdf, idea.title); // Use idea title for subsequent pages too
        }
      };

      // Helper function to add text with word wrapping
      const addWrappedText = async (text: string, fontSize: number = 10, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont(undefined, 'bold');
        } else {
          pdf.setFont(undefined, 'normal');
        }
        
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        await checkPageBreak(lines.length * lineHeight + 5);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * lineHeight + 5;
      };

      // Report title
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Experiment Idea Report: ${idea.title}`, margin, yPosition);
      yPosition += 20;

      // Generation info
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })}, ${new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Generated by: ${user.email?.split('@')[0] || 'Unknown'}@kapelczak.com`, margin, yPosition);
      yPosition += 20;

      // Experiment Idea section
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Experiment Idea: ${idea.title}`, margin, yPosition);
      yPosition += 15;

      // Basic information
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Status: ${idea.status}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Category: ${idea.category}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Priority: ${idea.priority}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Start Date: ${new Date(idea.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })}`, margin, yPosition);
      yPosition += 8;
      if (idea.estimated_duration) {
        pdf.text(`Duration: ${idea.estimated_duration}`, margin, yPosition);
        yPosition += 8;
      }
      yPosition += 10;

      // Description section
      if (idea.description) {
        await checkPageBreak(30);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Description:', margin, yPosition);
        yPosition += 10;
        
        const plainDescription = stripHtml(idea.description);
        await addWrappedText(plainDescription, 10);
        yPosition += 5;
      }

      // Hypothesis section
      if (idea.hypothesis) {
        await checkPageBreak(30);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Hypothesis:', margin, yPosition);
        yPosition += 10;
        
        const plainHypothesis = stripHtml(idea.hypothesis);
        await addWrappedText(plainHypothesis, 10);
        yPosition += 5;
      }

      // Methodology section
      if (idea.methodology) {
        await checkPageBreak(30);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Methodology:', margin, yPosition);
        yPosition += 10;
        
        const plainMethodology = stripHtml(idea.methodology);
        await addWrappedText(plainMethodology, 10);
        yPosition += 5;
      }

      // Required Materials section
      if (idea.required_materials) {
        await checkPageBreak(30);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Required Materials:', margin, yPosition);
        yPosition += 10;
        
        const plainMaterials = stripHtml(idea.required_materials);
        await addWrappedText(plainMaterials, 10);
        yPosition += 5;
      }

      // Expected Outcomes section
      if (idea.expected_outcomes) {
        await checkPageBreak(30);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Expected Outcomes:', margin, yPosition);
        yPosition += 10;
        
        const plainOutcomes = stripHtml(idea.expected_outcomes);
        await addWrappedText(plainOutcomes, 10);
        yPosition += 5;
      }

      // Budget section
      if (idea.budget_estimate) {
        await checkPageBreak(20);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Budget Estimate:', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(idea.budget_estimate, margin, yPosition);
        yPosition += 15;
      }

      // Tags section
      if (idea.tags && idea.tags.length > 0) {
        await checkPageBreak(20);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Tags:', margin, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(idea.tags.join(', '), margin, yPosition);
        yPosition += 15;
      }

      // Notes section
      if (includeNotes && notes.length > 0) {
        await checkPageBreak(30);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Research Notes:', margin, yPosition);
        yPosition += 15;

        for (const note of notes) {
          await checkPageBreak(40);
          
          pdf.setFontSize(11);
          pdf.setFont(undefined, 'bold');
          pdf.text(note.title, margin, yPosition);
          yPosition += 10;
          
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'normal');
          pdf.text(`Created: ${new Date(note.created_at).toLocaleDateString('en-US')}`, margin, yPosition);
          yPosition += 8;

          if (note.content) {
            const plainTextContent = stripHtml(note.content);
            const images = extractImages(note.content);
            
            if (plainTextContent) {
              await addWrappedText(plainTextContent, 10);
            }

            if (images.length > 0) {
              pdf.setFontSize(8);
              pdf.setFont(undefined, 'italic');
              pdf.text(`[Note: This note contains ${images.length} image(s)]`, margin, yPosition);
              yPosition += 8;
            }
          }
          
          yPosition += 5;
        }
      }

      // Footer with laboratory info and page numbers
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'normal');
        
        // Footer line
        const footerY = pageHeight - 20;
        pdf.setLineWidth(0.3);
        pdf.line(margin, footerY, pageWidth - margin, footerY);
        
        // Footer text
        pdf.text('© Kapelczak Laboratory - Confidential', margin, footerY + 8);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 40, footerY + 8);
      }

      try {
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
            size: '~' + Math.round(pageWidth * pageHeight / 1024) + 'KB'
          }])
          .select()
          .single();

        if (reportError) {
          console.error('Error saving report to database:', reportError);
        }

        // Download the PDF
        pdf.save(`experiment-idea-${idea.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

        return reportData;
      } catch (error) {
        console.error('Error in report generation:', error);
        pdf.save(`experiment-idea-${idea.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const generateAllIdeasReport = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const pdf = new jsPDF();
      const pageHeight = pdf.internal.pageSize.height;
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      let yPosition = await addLabHeader(pdf);

      // Helper function to check if we need a new page
      const checkPageBreak = async (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = await addLabHeader(pdf);
        }
      };

      // Report title
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('All Experiment Ideas Report', margin, yPosition);
      yPosition += 20;

      // Generation info
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })}, ${new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Generated by: ${user.email?.split('@')[0] || 'Unknown'}@kapelczak.com`, margin, yPosition);
      yPosition += 20;

      // Summary statistics
      const statusCounts = ideas.reduce((acc: any, idea) => {
        acc[idea.status] = (acc[idea.status] || 0) + 1;
        return acc;
      }, {});

      const priorityCounts = ideas.reduce((acc: any, idea) => {
        acc[idea.priority] = (acc[idea.priority] || 0) + 1;
        return acc;
      }, {});

      await checkPageBreak(60);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Summary Statistics', margin, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Total Ideas: ${ideas.length}`, margin, yPosition);
      yPosition += 10;
      
      pdf.text('Status Distribution:', margin, yPosition);
      yPosition += 8;
      Object.entries(statusCounts).forEach(([status, count]) => {
        pdf.text(`  ${status}: ${count}`, margin + 10, yPosition);
        yPosition += 6;
      });
      
      yPosition += 5;
      pdf.text('Priority Distribution:', margin, yPosition);
      yPosition += 8;
      Object.entries(priorityCounts).forEach(([priority, count]) => {
        pdf.text(`  ${priority}: ${count}`, margin + 10, yPosition);
        yPosition += 6;
      });

      yPosition += 20;

      // List all ideas
      await checkPageBreak(30);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('All Ideas', margin, yPosition);
      yPosition += 15;

      for (const [index, idea] of ideas.entries()) {
        await checkPageBreak(30);

        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${idea.title}`, margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Status: ${idea.status} | Priority: ${idea.priority} | Category: ${idea.category}`, margin + 5, yPosition);
        yPosition += 6;
        
        if (idea.description) {
          const plainDescription = stripHtml(idea.description);
          const descLines = pdf.splitTextToSize(plainDescription, pageWidth - 2 * margin - 10);
          pdf.text(descLines.slice(0, 2), margin + 5, yPosition);
          yPosition += Math.min(descLines.length, 2) * 4;
        }
        
        yPosition += 8;
      }

      // Footer with laboratory info and page numbers
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'normal');
        
        // Footer line
        const footerY = pageHeight - 20;
        pdf.setLineWidth(0.3);
        pdf.line(margin, footerY, pageWidth - margin, footerY);
        
        // Footer text
        pdf.text('© Kapelczak Laboratory - Confidential', margin, footerY + 8);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 40, footerY + 8);
      }

      try {
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
            size: '~' + Math.round(pageWidth * pageHeight / 1024) + 'KB'
          }])
          .select()
          .single();

        if (reportError) {
          console.error('Error saving report to database:', reportError);
        }

        pdf.save('all-experiment-ideas-report.pdf');
        return reportData;
      } catch (error) {
        console.error('Error in all ideas report generation:', error);
        pdf.save('all-experiment-ideas-report.pdf');
        throw error;
      }
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
