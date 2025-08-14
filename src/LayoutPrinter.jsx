import React, { useState, cloneElement } from "react";
import PropTypes from 'prop-types';
import { FaPrint } from "react-icons/fa";
import { AiOutlineClose } from 'react-icons/ai';
import { HiDocumentMagnifyingGlass } from "react-icons/hi2";
import jsPDF from 'jspdf';
import { toJpeg, toSvg } from 'html-to-image';
import { renderToStaticMarkup } from 'react-dom/server';
import Modal from 'react-modal';
import { ScaleLoader } from 'react-spinners';
import Iframe from 'react-iframe';

// For accessibility, it's important to set the app element for react-modal.
// This should be done in the app's entry point, but we can do a safe check here.
if (typeof window !== 'undefined' && document.getElementById('root')) {
    Modal.setAppElement('#root');
}

const DefaultSidePanel = () => <div />;
const DefaultFooterPanel = () => <div />;

export default function LayoutPrinter({
    children,
    elementRef,
    fileName = 'document',
    data = {},
    SidePanelComponent = DefaultSidePanel,
    FooterComponent = DefaultFooterPanel,
    logoUrl = '',
    facingImages = {},
    facingDataKey = 'facing',
    darkMode = false,
    pageFormats: customPageFormats,
    printFormats: customPrintFormats,
    onError,
}) {
    const pageFormats = customPageFormats || ['a2', 'a3', 'a4', 'a5'];
    const printFormats = customPrintFormats || [
        { label: 'jpeg', disabled: false },
        { label: 'pdf', disabled: false },
        { label: 'svg', disabled: false },
        { label: 'dwg', disabled: true },
        { label: 'dxf', disabled: true }
    ];

    const [modalIsOpen, setIsOpen] = useState(false);
    const [previewIsOpen, setPreviewIsOpen] = useState(false);
    const [pageFormat, setPageFormat] = useState('a4');
    const [printFormat, setPrintFormat] = useState('pdf');
    const [loading, setLoading] = useState(false);
    const [blobUrl, setBlobUrl] = useState('');

    const facingDim = { 'a2': { w: 60, h: 60 }, 'a3': { w: 50, h: 50 }, 'a4': { w: 40, h: 40 }, 'a5': { w: 30, h: 30 } };

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        setLoading(false);
    };

    const openPreview = () => setPreviewIsOpen(true);
    const closePreview = () => {
        setPreviewIsOpen(false);
        setLoading(false);
    };

    const generateImage = (format, options) => {
        const element = elementRef.current;
        if (!element) return Promise.reject('Element to print not found.');

        const imageFunc = {
            jpeg: toJpeg,
            png: toJpeg, // html-to-image toPng has issues, using jpeg for both
            svg: toSvg,
        }[format];

        if (!imageFunc) return Promise.reject(`Unsupported image format: ${format}`);

        return imageFunc(element, options).then(dataUrl => {
            const link = document.createElement('a');
            link.download = `${fileName}.${format === 'png' ? 'jpg' : format}`;
            link.href = dataUrl;
            link.click();
            link.remove();
        });
    };

    const generatePdf = (isPreview) => {
        return new Promise((resolve, reject) => {
            const element = elementRef.current;
            if (!element) return reject('Element to print not found.');

            const { width, height } = element.getBoundingClientRect();

            const pdf = new jsPDF({ orientation: 'l', format: pageFormat, unit: 'px' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 5;

            const sidePanelHtml = renderToStaticMarkup(<SidePanelComponent data={data} pageFormat={pageFormat} />);
            const footerHtml = renderToStaticMarkup(<FooterComponent data={data} pageFormat={pageFormat} logoUrl={logoUrl} />);

            const bestRatio = Math.min((pageWidth * 0.75) / width, (pageHeight * 0.85) / height);

            const pdfHTML = `
        <div id="full-frame" style="width: 100%; height: 100%; letter-spacing: -0.1px; font-family: 'Helvetica', 'sans-serif';">
          <div id="plot-img" style="width: ${pageWidth * 0.75}px; height: ${pageHeight * 0.85}px; border: solid 0.5px black; position: absolute; display: flex; align-items: center; justify-content: center;">
            <img src="plotUrl" width="${width * bestRatio}" height="${height * bestRatio}" style="max-width: 95%; max-height: 95%; z-index: -1;" />
          </div>
          <div id="legends" style="position: absolute; left: ${pageWidth * 0.78}px; top: 0; width: ${pageWidth * 0.20}px; border: solid 0.5px black; border-radius: 5px;">
            ${sidePanelHtml}
          </div>
          <div id="gen-notes" style="width: ${pageWidth - (margin * 4)}px; border: 1px solid grey; border-radius: 5px; padding: 5px; position: absolute; bottom: 10px; left: ${margin}px;">
            ${footerHtml}
          </div>
        </div>`;

            toJpeg(element, { quality: 1, backgroundColor: 'white', cacheBust: true })
                .then(plotImgUrl => {
                    if (data && facingDataKey && facingImages && facingImages[data[facingDataKey]]) {
                        pdf.addImage(facingImages[data[facingDataKey]], 'PNG',
                            pageWidth * 0.77 - margin, pageHeight * 0.7 - margin,
                            facingDim[pageFormat].w, facingDim[pageFormat].h
                        );
                    }

                    const finalHtml = pdfHTML.replace("plotUrl", plotImgUrl);

                    pdf.html(finalHtml, {
                        callback: function (doc) {
                            if (isPreview) {
                                resolve(doc.output('bloburl'));
                            } else {
                                doc.save(`${fileName}.pdf`);
                                resolve(true);
                            }
                        },
                        x: margin,
                        y: margin
                    });
                })
                .catch(reject);
        });
    };

    const handlePrint = async (isPreview = false) => {
        setLoading(true);
        try {
            let result;
            switch (printFormat) {
                case 'png':
                case 'jpeg':
                case 'svg':
                    result = await generateImage(printFormat, { quality: 1, backgroundColor: 'white' });
                    break;
                case 'pdf':
                    result = await generatePdf(isPreview);
                    break;
                default:
                    throw new Error(`Unsupported format: ${printFormat}`);
            }
            if (!isPreview) {
                closeModal();
            }
            return result;
        } catch (error) {
            console.error("Printing failed:", error);
            setLoading(false);
            if (onError) {
                onError(error);
            }
        }
    };

    const handlePreview = async () => {
        const url = await handlePrint(true);
        if (url) {
            setBlobUrl(url);
            openPreview();
        } else {
            setLoading(false);
        }
    };

    return (
        <>
            {cloneElement(children, { onClick: openModal })}
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={{ content: { width: '50%', height: '35%', top: '20%', left: '25%', right: 'auto', bottom: 'auto' } }}>
                <div className='w-full h-[40px] bg-slate-400 absolute top-0 left-0 flex items-center'>
                    <div className={`w-full text-center text-2xl font-semibold ${darkMode ? "text-blue-900" : "text-white"}`}>Print Options</div>
                    <AiOutlineClose className={`absolute right-6 ${darkMode ? "text-blue-900" : "text-white"} cursor-pointer hover:scale-110 duration-300`} size={24} onClick={closeModal} />
                </div>
                {loading && <ScaleLoader color="rgb(6,83,247)" className="absolute top-1/2 left-1/2 z-50 translate-y-[-50%] translate-x-[-50%]" />}
                <div className='w-full grid grid-flow-rows md:grid-cols-2 items-center justify-center gap-4 mt-1 pt-6 mb-4'>
                    <div className='flex items-center h-[48px] rounded-[40px] overflow-hidden text-[14px] font-semibold'>
                        <div className='w-full h-full flex items-center bg-secondaryBlue px-3 text-slate-200'>Page Format:</div>
                        <select className='border-[2px] h-full flex-1 px-3 rounded-r-[40px] outline-none cursor-pointer' onChange={(e) => setPageFormat(e.target.value)} value={pageFormat}>
                            {pageFormats.map(op => <option key={op} value={op}>{op.toUpperCase()}</option>)}
                        </select>
                    </div>
                    <div className='flex items-center h-[48px] rounded-[40px] overflow-hidden text-[14px] font-semibold'>
                        <div className='w-full h-full flex items-center bg-secondaryBlue px-3 text-slate-200'>Print Format:</div>
                        <select className='border-[2px] h-full flex-1 px-3 rounded-r-[40px] outline-none cursor-pointer' onChange={(e) => setPrintFormat(e.target.value)} value={printFormat}>
                            {printFormats.map(op => <option key={op.label} value={op.label} disabled={op.disabled}>{op.label.toUpperCase()}</option>)}
                        </select>
                    </div>
                </div>
                <div className='w-full flex items-center justify-center my-6 mt-12'>
                    <div className='flex items-center h-[48px] rounded-[40px] overflow-hidden text-[14px] text-slate-700 font-semibold justify-center hover:scale-110 duration-300 mr-2' onClick={() => handlePrint(false)}>
                        <button id='generate' className='w-full h-full flex items-center bg-secondaryBlue text-slate-200 px-6 justify-center'><FaPrint /> Print It!</button>
                    </div>
                    {printFormat === 'pdf' && (
                        <div className='flex items-center h-[48px] rounded-[40px] overflow-hidden text-[14px] text-slate-700 font-semibold justify-center hover:scale-110 duration-300' onClick={handlePreview}>
                            <button id='preview' className='w-full h-full flex items-center bg-secondaryBlue text-slate-200 px-6 justify-center'><HiDocumentMagnifyingGlass /> Print Preview!</button>
                        </div>
                    )}
                </div>
            </Modal>
            <Modal isOpen={previewIsOpen} onRequestClose={closePreview} style={{ content: { width: '95%', height: '90%', right: 'auto', bottom: 'auto', padding: '0' } }}>
                <div className='w-full h-[40px] bg-slate-400 justify-center absolute top-0 left-0 flex items-center'>
                    <div className={`w-full text-center text-2xl font-semibold ${darkMode ? "text-blue-900" : "text-white"}`}>Print Preview</div>
                    <AiOutlineClose className={`absolute right-6 ${darkMode ? "text-blue-900" : "text-white"} cursor-pointer hover:scale-110 duration-300`} size={24} onClick={closePreview} />
                </div>
                {loading && <ScaleLoader color="rgb(6,83,247)" className="absolute top-1/2 left-1/2 z-50 translate-y-[-50%] translate-x-[-50%]" />}
                <div className='w-full h-full pt-10'>
                    <Iframe url={blobUrl}
                        allow={"fullscreen"}
                        styles={{ border: "0", width: "100%", height: "100%" }} />
                </div>
            </Modal>
        </>
    );
}

LayoutPrinter.propTypes = {
    children: PropTypes.element.isRequired,
    elementRef: PropTypes.shape({ current: PropTypes.instanceOf(HTMLElement) }).isRequired,
    fileName: PropTypes.string,
    data: PropTypes.object,
    SidePanelComponent: PropTypes.elementType,
    FooterComponent: PropTypes.elementType,
    logoUrl: PropTypes.string,
    facingImages: PropTypes.object,
    facingDataKey: PropTypes.string,
    darkMode: PropTypes.bool,
    pageFormats: PropTypes.arrayOf(PropTypes.string),
    printFormats: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool.isRequired,
    })),
    onError: PropTypes.func,
};