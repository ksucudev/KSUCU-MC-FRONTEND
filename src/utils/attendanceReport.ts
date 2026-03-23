import { formatDateTime } from './timeUtils';

export const downloadAttendancePDF = (records: any[], leadershipRole: string, session: any) => {
    const sortedRecords = [...records].sort((a, b) => {
        const aIsVisitor = a.userType === 'visitor' || (a.regNo && a.regNo.startsWith('VISITOR-'));
        const bIsVisitor = b.userType === 'visitor' || (b.regNo && b.regNo.startsWith('VISITOR-'));
        if (aIsVisitor !== bIsVisitor) return aIsVisitor ? -1 : 1;
        return new Date(a.signedAt).getTime() - new Date(b.signedAt).getTime();
    });

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>KSUCU - ${session?.title || leadershipRole} - Attendance Report</title>
            <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; font-size: 12px; }
                .letterhead-img { width: 100%; max-width: 100%; height: auto; margin: 0 auto 15px; display: block; }
                .header { text-align: center; margin-bottom: 15px; }
                .header h2 { color: #730051; font-size: 18px; margin: 5px 0; font-weight: bold; }
                .session-info {
                    background: linear-gradient(135deg, #730051, #00C6FF);
                    color: white;
                    padding: 8px 15px;
                    border-radius: 5px;
                    margin: 10px 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .attendance-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 10px 0;
                    font-size: 11px;
                }
                .attendance-table th {
                    background: linear-gradient(135deg, #730051, #8e1a6b);
                    color: white;
                    padding: 8px 4px;
                    text-align: center;
                    font-weight: bold;
                    border: 1px solid #fff;
                }
                .attendance-table td {
                    padding: 4px;
                    text-align: center;
                    border: 1px solid #ddd;
                    vertical-align: middle;
                }
                .signature-cell img {
                    max-width: 100%;
                    max-height: 26px;
                    object-fit: contain;
                }
                .footer {
                    margin-top: 15px;
                    text-align: center;
                    font-size: 9px;
                    color: #666;
                    border-top: 2px solid #730051;
                    padding-top: 10px;
                }
            </style>
        </head>
        <body>
            <img src="${window.location.origin}/img/letterhead.png" class="letterhead-img" alt="KSUCU-MC Letterhead" />
            <div class="header"><h2>${session?.title || leadershipRole} - Attendance Report</h2></div>
            <div class="session-info">
                <div><strong>Leader:</strong> ${leadershipRole}</div>
                <div>
                    <strong>Total:</strong> ${sortedRecords.length}<br>
                    <strong>Date:</strong> ${formatDateTime(session?.startTime || new Date(), { format: 'medium' })}
                </div>
            </div>
            <table class="attendance-table">
                <thead>
                    <tr>
                        <th>#</th><th>NAME</th><th>TYPE</th><th>REG NO.</th><th>COURSE</th><th>SIGN TIME</th><th>SIGNATURE</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedRecords.map((r, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td style="text-align: left; font-weight: bold;">${r.userName}</td>
                            <td>${(r.userType === 'visitor' || r.regNo?.startsWith('VISITOR-')) ? 'VISITOR' : 'STUDENT'}</td>
                            <td>${r.regNo?.startsWith('VISITOR-') ? 'N/A' : r.regNo}</td>
                            <td>${r.course || 'N/A'}</td>
                            <td>${formatDateTime(r.signedAt, { format: 'short' })}</td>
                            <td class="signature-cell">
                                ${r.signature?.startsWith('data:image') ? `<img src="${r.signature}" alt="Sign" />` : 'N/A'}
                            </td>
                        </tr>`).join('')}
                </tbody>
            </table>
            <div class="footer"><p>KSUCU-MC | P.O BOX 408-40200, KISII, KENYA</p></div>
        </body>
        </html>
    `;

    // Use a hidden iframe so the user stays on the current page
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        // Wait for images (letterhead, signatures) to load, then print
        const images = iframeDoc.querySelectorAll('img');
        let loaded = 0;
        const totalImages = images.length;

        const triggerPrint = () => {
            try {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            } catch {
                // Fallback: if iframe print fails, open in new tab
                const fallback = window.open('', '_blank');
                if (fallback) {
                    fallback.document.open();
                    fallback.document.write(htmlContent);
                    fallback.document.close();
                    fallback.focus();
                    setTimeout(() => fallback.print(), 300);
                }
            }
            // Clean up iframe after a short delay
            setTimeout(() => {
                try { document.body.removeChild(iframe); } catch { /* already removed */ }
            }, 2000);
        };

        if (totalImages === 0) {
            setTimeout(triggerPrint, 100);
        } else {
            const onImageReady = () => {
                loaded++;
                if (loaded >= totalImages) triggerPrint();
            };
            images.forEach(img => {
                if (img.complete) {
                    onImageReady();
                } else {
                    img.addEventListener('load', onImageReady);
                    img.addEventListener('error', onImageReady);
                }
            });
            // Safety timeout in case images hang
            setTimeout(triggerPrint, 5000);
        }
    } else {
        document.body.removeChild(iframe);
    }
};
