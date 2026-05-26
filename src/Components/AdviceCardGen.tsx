import React, { useState, useEffect, useRef } from 'react';
import { AdviceCard } from '../types';
import { Download, Share2, Check, Copy, Sparkles, Award, Star, HelpCircle, Twitter, Linkedin } from 'lucide-react';
import { motion } from 'motion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface AdviceCardGenProps {
  initialCard: AdviceCard | null;
}

export default function AdviceCardGen({ initialCard }: AdviceCardGenProps) {
  const [card, setCard] = useState<AdviceCard | null>(null);
  const [styleMode, setStyleMode] = useState<AdviceCard['styling']>('branded');
  const [copystate, setCopystate] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Customization controls
  const [showWatermark, setShowWatermark] = useState(true);
  const [brandTheme, setBrandTheme] = useState<'teal' | 'indigo' | 'sunset' | 'rose' | 'ocean'>('teal');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [shadowIntensity, setShadowIntensity] = useState<'none' | 'soft' | 'deep' | 'glow'>('deep');
  const [isPrintFriendly, setIsPrintFriendly] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait' | 'landscape'>('square');
  const [cardPadding, setCardPadding] = useState<number>(32);

  // Sync baseline padding when canvas ratio shifts
  useEffect(() => {
    if (aspectRatio === 'landscape') {
      setCardPadding(24);
    } else if (aspectRatio === 'portrait') {
      setCardPadding(40);
    } else {
      setCardPadding(32);
    }
  }, [aspectRatio]);

  const ratioClasses = {
    square: 'aspect-square w-full',
    portrait: 'aspect-[4/5] w-full',
    landscape: 'aspect-[16/9] w-full'
  };

  const getSpacing = (ratio: 'square' | 'portrait' | 'landscape') => {
    if (ratio === 'landscape') {
      return {
        padding: 'p-5 md:p-6',
        innerGap: 'space-y-3',
        mainYGap: 'space-y-2',
        titleSize: 'text-sm md:text-base',
        stepsGap: 'space-y-1',
        footerMargin: 'mt-3 pt-2'
      };
    } else if (ratio === 'portrait') {
      return {
        padding: 'p-8 md:p-10',
        innerGap: 'space-y-6',
        mainYGap: 'space-y-5',
        titleSize: 'text-lg md:text-xl',
        stepsGap: 'space-y-2.5',
        footerMargin: 'mt-8 pt-4'
      };
    } else {
      return {
        padding: 'p-7 md:p-8',
        innerGap: 'space-y-4 md:space-y-5',
        mainYGap: 'space-y-3.5',
        titleSize: 'text-base md:text-lg',
        stepsGap: 'space-y-1.5',
        footerMargin: 'mt-6 pt-3.5'
      };
    }
  };

  const shadowClasses = {
    none: 'shadow-none',
    soft: 'shadow-md',
    deep: 'shadow-2xl',
    glow: brandTheme === 'teal' ? 'shadow-[0_0_25px_rgba(0,255,194,0.35)] hover:shadow-[0_0_35px_rgba(0,255,194,0.5)]'
        : brandTheme === 'indigo' ? 'shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)]'
        : brandTheme === 'sunset' ? 'shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)]'
        : brandTheme === 'rose' ? 'shadow-[0_0_25px_rgba(244,63,94,0.35)] hover:shadow-[0_0_35px_rgba(244,63,94,0.5)]'
        : 'shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]'
  };

  const fontFamilies = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  };
  
  const cardRef = useRef<HTMLDivElement>(null);

  const themeStyles = {
    teal: {
      accentText: 'text-[#00FFC2]',
      accentBg: 'bg-[#00FFC2]',
      accentBorder: 'border-[#00FFC2]',
      gradientBg: 'bg-gradient-to-tr from-[#0c0c0f] via-[#0c0c0f]/95 to-[#121c19]',
      accentGlow: 'bg-[#00FFC2]/5',
      pillBg: 'bg-emerald-500/15',
      pillText: 'text-emerald-400',
      pillBorder: 'border-emerald-500/30',
      pulseBg: 'bg-[#00FFC2]',
      bulletSymbol: '>',
      radialAccent: 'bg-[#00FFC2]/10',
    },
    indigo: {
      accentText: 'text-indigo-400',
      accentBg: 'bg-indigo-500',
      accentBorder: 'border-indigo-500',
      gradientBg: 'bg-gradient-to-tr from-[#05050c] via-[#0a0a16] to-[#14142f]',
      accentGlow: 'bg-indigo-500/10',
      pillBg: 'bg-indigo-500/15',
      pillText: 'text-indigo-300',
      pillBorder: 'border-indigo-500/30',
      pulseBg: 'bg-indigo-400',
      bulletSymbol: '◆',
      radialAccent: 'bg-indigo-500/20',
    },
    sunset: {
      accentText: 'text-amber-500',
      accentBg: 'bg-amber-500',
      accentBorder: 'border-amber-500',
      gradientBg: 'bg-gradient-to-tr from-[#080503] via-[#140b05] to-[#261505]',
      accentGlow: 'bg-amber-500/10',
      pillBg: 'bg-amber-500/15',
      pillText: 'text-amber-400',
      pillBorder: 'border-amber-500/30',
      pulseBg: 'bg-amber-400',
      bulletSymbol: '✦',
      radialAccent: 'bg-amber-500/15',
    },
    rose: {
      accentText: 'text-rose-400',
      accentBg: 'bg-rose-500',
      accentBorder: 'border-rose-500',
      gradientBg: 'bg-gradient-to-tr from-[#080305] via-[#14060c] to-[#2b0c1e]',
      accentGlow: 'bg-rose-500/10',
      pillBg: 'bg-rose-500/15',
      pillText: 'text-rose-400',
      pillBorder: 'border-rose-500/30',
      pulseBg: 'bg-rose-400',
      bulletSymbol: '•',
      radialAccent: 'bg-rose-500/20',
    },
    ocean: {
      accentText: 'text-cyan-400',
      accentBg: 'bg-cyan-500',
      accentBorder: 'border-cyan-500',
      gradientBg: 'bg-gradient-to-tr from-[#03080c] via-[#06121a] to-[#0d2638]',
      accentGlow: 'bg-cyan-500/10',
      pillBg: 'bg-cyan-500/15',
      pillText: 'text-cyan-400',
      pillBorder: 'border-cyan-500/30',
      pulseBg: 'bg-cyan-400',
      bulletSymbol: '::',
      radialAccent: 'bg-cyan-400/20',
    }
  };

  useEffect(() => {
    if (initialCard) {
      setCard({ ...initialCard });
      setStyleMode(initialCard.styling || 'branded');
    }
  }, [initialCard]);

  const handleExportPDF = async () => {
    if (!cardRef.current || !card) return;
    setExporting(true);

    try {
      const element = cardRef.current;
      
      // Determine optimum background color based on theme and mode
      let bgColor = '#0c0c0f';
      if (isPrintFriendly) {
        bgColor = '#ffffff';
      } else {
        if (styleMode === 'minimal') bgColor = '#050507';
        else if (styleMode === 'dark_minimalism') bgColor = '#09090b';
        else if (styleMode === 'vivid_executive') bgColor = '#070b19';
        
        // Fine-tune background colors to ensure premium background density on export
        if (brandTheme === 'indigo') bgColor = styleMode === 'minimal' ? '#05050c' : '#0a0a16';
        else if (brandTheme === 'sunset') bgColor = styleMode === 'minimal' ? '#080503' : '#140b05';
        else if (brandTheme === 'rose') bgColor = styleMode === 'minimal' ? '#080305' : '#14060c';
        else if (brandTheme === 'ocean') bgColor = styleMode === 'minimal' ? '#03080c' : '#06121a';
      }

      // Capture the Advice Card element with high scale multiplier for premium 300+ DPI text density
      const canvas = await html2canvas(element, {
        scale: 3, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: bgColor,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dynamic canvas size & preserve original layout ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const aspectRatio = imgWidth / imgHeight;

      // Executive-grade standard card layout width specs
      const pdfWidth = 180;
      const pdfHeight = pdfWidth / aspectRatio;

      const pdf = new jsPDF({
        orientation: aspectRatio > 1 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      // Embed high contrast canvas image cleanly matching full bounds
      pdf.addPage(); // Use dynamic format sizing
      // Actually we'll construct jsPDF with standard sizing or custom array correctly
      const finePDF = new jsPDF({
        orientation: aspectRatio > 1 ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      // We overwrite pdf as finePDF so there's no blank page
      finePDF.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      const fileName = `MentorAI-AdviceCard-${card.headline.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
      finePDF.save(fileName);
    } catch (error) {
      console.error('Error generating high-resolution PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  if (!card) {
    return (
      <div className="bg-immersive-card border border-immersive-border rounded-2xl p-8 text-center text-immersive-dim font-sans transition-all">
        <HelpCircle className="h-8 w-8 mx-auto text-immersive-accent mb-3" />
        No active decision outputs mapped. Submit a query to trigger your automated Advice Card.
      </div>
    );
  }

  // Handle Editing
  const updateCardField = (key: keyof AdviceCard, val: any) => {
    setCard(prev => prev ? { ...prev, [key]: val } : null);
  };

  const updateCardStep = (index: number, val: string) => {
    setCard(prev => {
      if (!prev) return null;
      const updatedSteps = [...prev.steps];
      updatedSteps[index] = val;
      return { ...prev, steps: updatedSteps };
    });
  };

  const handleCopy = () => {
    // Generate beautiful clean Markdown quote block for LinkedIn or Twitter
    const markdownQuote = `🔥 KEY DECISION INSIGHT BY MENTORAI:
"${card.headline}"
  
🏛️ Core Framework: ${card.coreFramework}
  
🪜 Actionable Steps:
${card.steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}
  
💡 Top Takeaway:
"${card.takeaway}"
  
---
Generated by MentorAI — Your billion-dollar brain on demand.
#Productivity #Business #Mentorship #DecisionOS`;

    navigator.clipboard.writeText(markdownQuote);
    setCopystate(true);
    setTimeout(() => setCopystate(false), 2200);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      
      {/* Visual Workspace Canvas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-sans font-bold text-xs uppercase text-[#71717A] tracking-wider">Social Advice Card Workspace</h4>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Interactive Preview</span>
        </div>

        {/* The Card template render container */}
        <div ref={cardRef} className={`relative overflow-hidden rounded-2xl border ${isPrintFriendly ? 'border-zinc-300 shadow-none bg-white' : 'border-[#1A1A1E] ' + shadowClasses[shadowIntensity]} transition-all duration-300 ${ratioClasses[aspectRatio]}`}>
          {styleMode === 'minimal' && (
            <div 
              className={`${isPrintFriendly ? 'bg-white text-zinc-900' : (brandTheme === 'teal' ? 'bg-[#050507]' : themeStyles[brandTheme].gradientBg)} h-full w-full flex flex-col justify-between ${fontFamilies[fontFamily]} ${isPrintFriendly ? 'text-zinc-900' : 'text-zinc-300'}`}
              style={{ padding: `${cardPadding}px` }}
            >
              <div className={getSpacing(aspectRatio).mainYGap}>
                {showWatermark && (
                  <p className={`${isPrintFriendly ? 'text-zinc-500' : 'text-zinc-600'} text-[10px]`}>// DECISION INSIGHT PLATFORM — MENTORAI</p>
                )}
                <h5 className={`${isPrintFriendly ? 'text-black' : 'text-white'} ${getSpacing(aspectRatio).titleSize} font-bold tracking-tight leading-snug uppercase`}>
                  &gt; {card.headline || "Action Strategy Outline"}
                </h5>
                <p className={`text-[11px] ${isPrintFriendly ? 'text-zinc-805 font-extrabold shadow-sm' : themeStyles[brandTheme].accentText} font-semibold uppercase`}>Framework: {card.coreFramework}</p>
                <ul className={`${getSpacing(aspectRatio).stepsGap} text-xs ${isPrintFriendly ? 'text-zinc-700' : 'text-zinc-400'} pl-4 list-disc`}>
                  {card.steps.map((s, idx) => (
                    <li key={idx} className="leading-relaxed">{s}</li>
                  ))}
                </ul>
              </div>
              <div className={`${getSpacing(aspectRatio).footerMargin} border-t ${isPrintFriendly ? 'border-zinc-200 text-zinc-500' : 'border-[#1A1A1E] text-[#71717A]'} flex justify-between text-[9px] uppercase tracking-widest`}>
                <span>Confidence: 94%</span>
                <span>STATUS: {showWatermark ? 'SECURE_HEALED' : 'ONLINE_SECURE'}</span>
              </div>
            </div>
          )}

          {styleMode === 'detailed' && (
            <div 
              className={`${isPrintFriendly ? 'bg-white' : (brandTheme === 'teal' ? 'bg-[#0C0C0F]' : themeStyles[brandTheme].gradientBg)} border-0 h-full w-full flex flex-col justify-between ${fontFamilies[fontFamily]} ${isPrintFriendly ? 'text-zinc-900' : 'text-slate-300'}`}
              style={{ padding: `${cardPadding}px` }}
            >
              <div className={getSpacing(aspectRatio).innerGap}>
                <div className={`flex items-center gap-2 border-b ${isPrintFriendly ? 'border-zinc-200 pb-2.5' : 'border-[#1A1A1E] pb-2.5'}`}>
                  <Award className={`h-4.5 w-4.5 ${isPrintFriendly ? 'text-zinc-800' : themeStyles[brandTheme].accentText}`} />
                  <span className={`font-mono text-[9px] tracking-widest ${isPrintFriendly ? 'text-zinc-500' : 'text-[#71717A]'} uppercase`}>
                    {showWatermark ? 'Executive Directive' : 'Strategic Directive'}
                  </span>
                </div>
                <div className={getSpacing(aspectRatio).mainYGap}>
                  <h5 className={`${getSpacing(aspectRatio).titleSize} font-extrabold ${isPrintFriendly ? 'text-black' : 'text-white'} tracking-tight leading-snug`}>
                    {card.headline}
                  </h5>
                  <p className={`text-xs ${isPrintFriendly ? 'text-zinc-805 font-bold' : themeStyles[brandTheme].accentText} font-mono italic`}>Utilizing: {card.coreFramework}</p>
                  <p className={`text-xs md:text-sm ${isPrintFriendly ? 'text-zinc-700' : 'text-zinc-400'} leading-relaxed`}>{card.takeaway}</p>
                </div>
              </div>
              {showWatermark ? (
                <div className={`text-[9px] font-mono ${isPrintFriendly ? 'text-zinc-500' : 'text-slate-500'} ${getSpacing(aspectRatio).footerMargin}`}>
                  PRODUCED ON-DEMAND BY MENTORAI
                </div>
              ) : (
                <div className={`text-[9px] font-mono ${isPrintFriendly ? 'text-zinc-400' : 'text-slate-600'} ${getSpacing(aspectRatio).footerMargin}`}>
                  OFFICIAL BOARD BLUEPRINT
                </div>
              )}
            </div>
          )}

          {styleMode === 'branded' && (
            <div 
              className={`${isPrintFriendly ? 'bg-white text-zinc-900' : themeStyles[brandTheme].gradientBg} h-full w-full flex flex-col justify-between ${fontFamilies[fontFamily]} ${isPrintFriendly ? 'text-zinc-900' : 'text-slate-200'} relative`}
              style={{ padding: `${cardPadding}px` }}
            >
              {!isPrintFriendly && (
                <div className={`absolute top-0 right-0 w-32 h-32 ${themeStyles[brandTheme].radialAccent} rounded-full blur-2xl top-right pointer-events-none`} />
              )}
              <div className={`z-10 ${getSpacing(aspectRatio).innerGap}`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 ${isPrintFriendly ? 'text-zinc-700 font-bold' : themeStyles[brandTheme].accentText} uppercase tracking-wider font-mono text-[9px]`}>
                    <Sparkles className="h-3 w-3 animate-pulse" style={{ animationDuration: '3s' }} />
                    {showWatermark ? 'Billionaire Mentorship Blueprints' : 'Executive Mentorship Blueprint'}
                  </div>
                  <Star className={`h-4 w-4 ${isPrintFriendly ? 'text-zinc-700 fill-zinc-100' : themeStyles[brandTheme].accentText + ' fill-current/30'}`} />
                </div>

                <div className={getSpacing(aspectRatio).mainYGap}>
                  <h5 className={`${getSpacing(aspectRatio).titleSize} font-black ${isPrintFriendly ? 'text-black' : 'text-white'} leading-tight tracking-tight`}>
                    {card.headline}
                  </h5>
                  <div className={`h-[2px] w-12 ${isPrintFriendly ? 'bg-zinc-800' : themeStyles[brandTheme].accentBg} rounded`} />
                  <p className="font-mono text-[9px] uppercase text-zinc-500 tracking-wide">
                    FRAMEWORK: <span className={isPrintFriendly ? 'text-black font-extrabold' : themeStyles[brandTheme].accentText}>{card.coreFramework}</span>
                  </p>
                </div>

                <div className={`${isPrintFriendly ? 'bg-zinc-105 border border-zinc-200' : 'bg-[#050507]/80 border border-[#1A1A1E]'} p-3.5 rounded-xl backdrop-blur-sm`}>
                  <p className={`text-xs ${isPrintFriendly ? 'text-zinc-800' : 'text-zinc-300'} leading-relaxed italic`}>
                    "{card.takeaway}"
                  </p>
                </div>
              </div>

              <div className={`flex items-center justify-between text-[9px] font-mono ${isPrintFriendly ? 'text-zinc-500' : 'text-[#71717A]'} uppercase tracking-widest ${getSpacing(aspectRatio).footerMargin} z-10`}>
                <span>{showWatermark ? 'Verified by MentorAI' : 'Strategic Outcome'}</span>
                <span>SYSTEM VERSION 2.5</span>
              </div>
            </div>
          )}

          {styleMode === 'dark_minimalism' && (
            <div 
              className={`${isPrintFriendly ? 'bg-white' : (brandTheme === 'teal' ? 'bg-[#09090b]' : themeStyles[brandTheme].gradientBg)} border ${isPrintFriendly ? 'border-zinc-300' : 'border-[#27272a]'} h-full w-full flex flex-col justify-between ${fontFamilies[fontFamily]} ${isPrintFriendly ? 'text-zinc-900' : 'text-zinc-100'} relative`}
              style={{ padding: `${cardPadding}px` }}
            >
              <div className={getSpacing(aspectRatio).innerGap}>
                <div className={`flex items-center justify-between border-b ${isPrintFriendly ? 'border-zinc-200' : 'border-zinc-800'} pb-3`}>
                  <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${isPrintFriendly ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {showWatermark ? 'Mente — Absolute Insight' : 'Strategic Action Plan'}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">[ CODE-INT-09 ]</span>
                </div>
                
                <div className={getSpacing(aspectRatio).mainYGap}>
                  <h5 className={`${getSpacing(aspectRatio).titleSize} font-normal ${isPrintFriendly ? 'text-black' : 'text-white'} tracking-tight leading-relaxed ${fontFamilies[fontFamily]} italic`}>
                    "{card.headline}"
                  </h5>
                  <div className="space-y-1.5 pb-1">
                    <p className={`text-[9px] uppercase font-mono tracking-widest ${isPrintFriendly ? 'text-zinc-700 font-bold' : themeStyles[brandTheme].accentText}`}>Methodology & Framework</p>
                    <p className={`text-xs ${isPrintFriendly ? 'text-zinc-800' : 'text-zinc-400'} font-sans tracking-wide leading-relaxed`}>{card.coreFramework}</p>
                  </div>
                  
                  {card.steps && card.steps.length > 0 && (
                    <div className={`pt-2 border-t ${isPrintFriendly ? 'border-zinc-200' : 'border-zinc-900'} space-y-1.5`}>
                      <p className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">Immediate Milestones</p>
                      <ul className={`${getSpacing(aspectRatio).stepsGap} text-xs ${isPrintFriendly ? 'text-zinc-805' : 'text-zinc-400'} ${fontFamilies[fontFamily]}`}>
                        {card.steps.map((st, i) => (
                          <li key={i} className="flex gap-2">
                            <span className={isPrintFriendly ? 'text-black font-extrabold' : themeStyles[brandTheme].accentText}>{themeStyles[brandTheme].bulletSymbol}</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className={`${getSpacing(aspectRatio).footerMargin} border-t ${isPrintFriendly ? 'border-zinc-200 text-zinc-500' : 'border-zinc-800 text-zinc-500'} flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.15em]`}>
                <span>CLASS-A SECURE SECTOR</span>
                {showWatermark && (
                  <span className="text-zinc-400 bg-zinc-800/40 border border-zinc-700/45 px-2 py-0.5 rounded">MENTORAI VERIFIED</span>
                )}
              </div>
            </div>
          )}

          {styleMode === 'vivid_executive' && (
            <div 
              className={`${isPrintFriendly ? 'bg-white' : themeStyles[brandTheme].gradientBg} border ${isPrintFriendly ? 'border-zinc-300' : 'border-indigo-500/30'} h-full w-full flex flex-col justify-between ${fontFamilies[fontFamily]} ${isPrintFriendly ? 'text-zinc-900' : 'text-slate-100'} relative overflow-hidden`}
              style={{ padding: `${cardPadding}px` }}
            >
              {!isPrintFriendly && (
                <>
                  <div className={`absolute top-[-10%] left-[-10%] w-48 h-48 ${themeStyles[brandTheme].radialAccent} rounded-full blur-3xl pointer-events-none`} />
                  <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                </>
              )}
              
              <div className={`z-10 ${getSpacing(aspectRatio).innerGap}`}>
                <div className="flex items-center justify-between">
                  <div className={`${isPrintFriendly ? 'bg-zinc-100 border border-zinc-300 text-zinc-800' : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'} px-2 py-0.5 rounded-md flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isPrintFriendly ? 'bg-zinc-650' : 'bg-emerald-400 animate-pulse'}`} />
                    {showWatermark ? 'Vivid Strategy' : 'Direct Strategy'}
                  </div>
                  <span className={`text-[9px] font-mono ${isPrintFriendly ? 'text-zinc-500' : 'text-indigo-400'} tracking-wider`}>EXEC // BLUEPRINT</span>
                </div>

                <div className={getSpacing(aspectRatio).mainYGap}>
                  <h5 className={`${getSpacing(aspectRatio).titleSize} font-black ${isPrintFriendly ? 'text-black' : 'text-white'} tracking-tight leading-tight uppercase`}>
                    {card.headline}
                  </h5>
                  <div className={`p-3 md:p-4 ${isPrintFriendly ? 'bg-zinc-50 border border-zinc-200' : 'bg-white/[0.03] border border-white/[0.08]'} rounded-xl backdrop-blur-md space-y-2`}>
                    <p className={`font-mono text-[9px] uppercase tracking-wider ${isPrintFriendly ? 'text-zinc-700 font-bold' : themeStyles[brandTheme].accentText} mb-1`}>Primary Mandate / Framework</p>
                    <p className={`text-xs ${isPrintFriendly ? 'text-black font-semibold' : 'text-white'} font-medium`}>{card.coreFramework}</p>
                    <p className={`text-xs ${isPrintFriendly ? 'text-zinc-700' : 'text-slate-300'} leading-relaxed italic border-t ${isPrintFriendly ? 'border-zinc-200' : 'border-white/[0.05]'} pt-1.5`}>
                      "{card.takeaway}"
                    </p>
                  </div>
                </div>
              </div>

              <div className={`flex items-center justify-between border-t ${isPrintFriendly ? 'border-zinc-200 text-zinc-550' : 'border-white/[0.08] text-slate-400'} ${getSpacing(aspectRatio).footerMargin} z-10 text-[9px] font-mono tracking-wider`}>
                <span>{showWatermark ? 'EXECUTIVE DECISION BOARD' : 'MANAGEMENT BOARD'}</span>
                <span className={`font-bold uppercase ${isPrintFriendly ? 'text-black' : themeStyles[brandTheme].accentText}`}>OUTCOME ACCELERATOR</span>
              </div>
            </div>
          )}
        </div>

        {/* Workspace Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Copy CTA Action */}
          <button
            onClick={handleCopy}
            className="w-full bg-immersive-card hover:bg-immersive-aside text-immersive-text-white font-sans font-bold text-xs tracking-tight border border-immersive-border p-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-xl cursor-pointer"
          >
            {copystate ? (
              <>
                <Check className="h-4 w-4 text-immersive-accent" />
                Copied! ✓
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-immersive-accent" />
                Copy formatted Advice
              </>
            )}
          </button>

          {/* Export PDF Action */}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className={`w-full font-sans font-bold text-xs tracking-tight p-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-xl cursor-pointer ${
              exporting 
                ? 'bg-immersive-card text-immersive-dim border border-immersive-border' 
                : 'bg-[#00FFC2] hover:bg-[#00FFC2]/85 text-black'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-immersive-dim border-t-transparent" />
                Brewing PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export High-Res PDF
              </>
            )}
          </button>
        </div>

        {/* Social Share Broadcast System */}
        <div className="space-y-2.5 pt-1 border-t border-immersive-border/40">
          <span className="text-[10px] font-mono uppercase tracking-wider text-immersive-dim block">Instant Social Drafts</span>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `🔥 STRATEGIC INSIGHT: "${card.headline}"\n\n🏛️ Framework: ${card.coreFramework}\n💡 Takeaway: "${card.takeaway}"\n\nGenerated with MentorAI — Your billion-dollar brain on demand.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/15 text-[#1DA1F2] border border-[#1DA1F2]/25 font-sans font-bold text-xs p-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <Twitter className="h-3.5 w-3.5 fill-current" />
              Twitter / X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                'https://ai.studio/build'
              )}&summary=${encodeURIComponent(
                `🔥 STRATEGIC INSIGHT: "${card.headline}"\n\n🏛️ Framework: ${card.coreFramework}\n💡 Takeaway: "${card.takeaway}"`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0077B5]/10 hover:bg-[#0077B5]/15 text-[#0077B5] border border-[#0077B5]/25 font-sans font-bold text-xs p-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              <Linkedin className="h-3.5 w-3.5 fill-current" />
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Editor & Style Customizer */}
      <div className="space-y-6">
        <div>
          <h4 className="font-sans font-bold text-xs uppercase text-immersive-dim tracking-wider mb-3">Card Canvas Theme</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['branded', 'detailed', 'minimal', 'dark_minimalism', 'vivid_executive'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStyleMode(mode)}
                className={`p-2.5 rounded-lg border text-xs font-semibold capitalize font-sans transition-all duration-200 cursor-pointer ${
                  styleMode === mode
                    ? 'border-[#00FFC2] bg-[#00FFC2]/15 text-[#00FFC2] font-bold'
                    : 'border-immersive-border bg-immersive-bg text-immersive-dim hover:border-[#00FFC2]/50'
                }`}
              >
                {mode === 'branded' && '✨ Branded'}
                {mode === 'detailed' && '📋 Executive'}
                {mode === 'minimal' && '💻 Terminal'}
                {mode === 'dark_minimalism' && '🖤 Dark Minimal'}
                {mode === 'vivid_executive' && '⚡ Vivid Exec'}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="space-y-2.5 border-b border-immersive-border pb-4">
          <div className="flex justify-between items-center">
            <h4 className="font-sans font-bold text-xs uppercase text-immersive-dim tracking-wider">Canvas Ratio Layout</h4>
            <span className="text-[9px] font-mono text-[#00FFC2] uppercase bg-[#00FFC2]/10 px-2 py-0.5 rounded">Social & Slides</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['square', 'portrait', 'landscape'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`py-3 px-2 rounded-lg border text-xs font-semibold capitalize font-sans transition-all duration-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  aspectRatio === ratio
                    ? 'border-[#00FFC2] bg-[#00FFC2]/15 text-[#00FFC2] font-bold shadow-[0_0_10px_rgba(0,255,194,0.1)]'
                    : 'border-immersive-border bg-immersive-bg text-immersive-dim hover:border-[#00FFC2]/50 hover:text-white'
                }`}
              >
                {ratio === 'square' && (
                  <>
                    <span className="text-sm font-sans">▢</span>
                    <span className="font-sans">Square <span className="text-[9px] block text-immersive-dim font-mono mt-0.5">1:1 (Feed)</span></span>
                  </>
                )}
                {ratio === 'portrait' && (
                  <>
                    <span className="text-sm font-sans">▮</span>
                    <span className="font-sans">Portrait <span className="text-[9px] block text-immersive-dim font-mono mt-0.5">4:5 (Insta)</span></span>
                  </>
                )}
                {ratio === 'landscape' && (
                  <>
                    <span className="text-sm font-sans">▬</span>
                    <span className="font-sans">Landscape <span className="text-[9px] block text-immersive-dim font-mono mt-0.5">16:9 (Slides)</span></span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Padding Control Slider */}
        <div className="space-y-2.5 border-b border-immersive-border pb-4">
          <div className="flex justify-between items-center">
            <h4 className="font-sans font-bold text-xs uppercase text-immersive-dim tracking-wider">Internal Spacing (Padding)</h4>
            <span className="text-[10px] font-mono text-[#00FFC2] uppercase font-bold bg-[#00FFC2]/15 px-2 py-0.5 rounded">{cardPadding}px</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="12"
              max="64"
              step="2"
              value={cardPadding}
              onChange={(e) => setCardPadding(parseInt(e.target.value))}
              className="w-full h-1 bg-[#121214] rounded-lg appearance-none cursor-pointer accent-[#00FFC2] border border-immersive-border"
            />
            <div className="flex justify-between text-[9px] font-mono text-immersive-dim">
              <span>Tight (12px)</span>
              <span>Balanced (32px)</span>
              <span>Spacious (64px)</span>
            </div>
          </div>
        </div>

        {/* Card Brand Accents */}
        <div className="space-y-4 border-b border-immersive-border pb-4">
          <div className="flex items-center justify-between">
            <h4 className="font-sans font-bold text-xs uppercase text-immersive-dim tracking-wider">Canvas Brand Accents</h4>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="watermark-toggle"
                checked={showWatermark}
                onChange={(e) => setShowWatermark(e.target.checked)}
                className="rounded border-immersive-border text-[#00FFC2] bg-immersive-bg focus:ring-[#00FFC2] h-3.5 w-3.5 cursor-pointer"
              />
              <label htmlFor="watermark-toggle" className="text-xs font-sans text-immersive-text cursor-pointer select-none">
                Watermark Stamp
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {(['teal', 'indigo', 'sunset', 'rose', 'ocean'] as const).map((themeName) => {
              const bgBadge = themeName === 'teal' ? 'bg-[#00FFC2]' 
                            : themeName === 'indigo' ? 'bg-indigo-500' 
                            : themeName === 'sunset' ? 'bg-amber-500' 
                            : themeName === 'rose' ? 'bg-rose-500' 
                            : 'bg-cyan-500';
              return (
                <button
                  key={themeName}
                  onClick={() => setBrandTheme(themeName)}
                  title={`Apply ${themeName} brand gradient`}
                  className={`relative p-2 rounded-lg border text-[10px] font-mono capitalize transition-all duration-200 flex flex-col items-center gap-1 cursor-pointer ${
                    brandTheme === themeName
                      ? 'border-[#00FFC2] bg-[#00FFC2]/10 text-[#00FFC2] font-bold'
                      : 'border-immersive-border bg-immersive-card text-immersive-dim hover:border-immersive-accent/30'
                  }`}
                >
                  <span className={`h-2 rounded-full w-2 ${bgBadge}`} />
                  {themeName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Core Print-Friendly Control */}
        <div className="space-y-3 border-b border-immersive-border pb-4">
          <div className="flex justify-between items-center">
            <label className="font-sans font-bold text-xs uppercase text-immersive-dim tracking-wider block">
              Physical Print Layout
            </label>
            <span className="text-[9px] font-mono text-[#00FFC2] uppercase bg-[#00FFC2]/10 px-2 py-0.5 rounded">High contrast</span>
          </div>
          <button
            onClick={() => setIsPrintFriendly(p => !p)}
            className={`w-full py-3 px-4 rounded-xl border text-xs font-bold font-sans transition-all duration-300 flex items-center justify-between cursor-pointer ${
              isPrintFriendly
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.15)] animate-none'
                : 'bg-immersive-bg text-immersive-dim border-immersive-border hover:border-white hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🖨️</span>
              <span>{isPrintFriendly ? "Active: White Monochrome Print Style" : "Toggle Print-Friendly view"}</span>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${isPrintFriendly ? 'bg-black bg-opacity-95' : 'bg-[#0f0f12]'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${isPrintFriendly ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>

        {/* Card Typography Selector */}
        <div className="space-y-2 border-b border-immersive-border pb-4">
          <label htmlFor="font-family-select" className="font-sans font-bold text-xs uppercase text-immersive-dim tracking-wider block">
            Card Typography
          </label>
          <div className="relative">
            <select
              id="font-family-select"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as 'sans' | 'serif' | 'mono')}
              className="w-full bg-immersive-bg border border-immersive-border text-immersive-text rounded-lg p-2.5 text-xs focus:outline-none focus:border-immersive-accent transition-all appearance-none cursor-pointer"
            >
              <option value="sans" className="bg-immersive-card text-immersive-text">Sans-Serif (Inter / Standard UI)</option>
              <option value="serif" className="bg-immersive-card text-immersive-text">Serif (Editorial / Classic)</option>
              <option value="mono" className="bg-immersive-card text-immersive-text">Monospace (Technical / Terminal)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-immersive-dim">
              <span className="text-[10px]">&gt;</span>
            </div>
          </div>
        </div>

        {/* Card Shadow Selector */}
        <div className="space-y-2 border-b border-immersive-border pb-4">
          <label className="font-sans font-bold text-xs uppercase text-immersive-dim tracking-wider block">
            Card Shadow Intensity
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['none', 'soft', 'deep', 'glow'] as const).map((intensity) => (
              <button
                key={intensity}
                onClick={() => setShadowIntensity(intensity)}
                className={`py-2 p-1 rounded-lg border text-xs font-semibold capitalize font-sans transition-all duration-200 cursor-pointer text-center ${
                  shadowIntensity === intensity
                    ? 'border-[#00FFC2] bg-[#00FFC2]/15 text-[#00FFC2] font-bold'
                    : 'border-immersive-border bg-immersive-bg text-immersive-dim hover:border-[#00FFC2]/50'
                }`}
              >
                {intensity}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-sans font-bold text-xs uppercase text-immersive-dim tracking-wider border-b border-immersive-border pb-2">Customize Metadata</h4>
          
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-immersive-dim">Card Title Headline</label>
            <input
              type="text"
              value={card.headline}
              onChange={(e) => updateCardField('headline', e.target.value)}
              className="w-full bg-immersive-bg border border-immersive-border text-immersive-text rounded-lg p-2.5 text-xs focus:outline-none focus:border-immersive-accent transition-all animate-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-immersive-dim">Core Blueprint Framework</label>
            <input
              type="text"
              value={card.coreFramework}
              onChange={(e) => updateCardField('coreFramework', e.target.value)}
              className="w-full bg-immersive-bg border border-immersive-border text-immersive-text rounded-lg p-2.5 text-xs focus:outline-none focus:border-immersive-accent transition-all animate-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-mono uppercase text-immersive-dim block">Edit Actionable Milestones</label>
            {card.steps.map((step, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="font-mono text-immersive-dim border border-immersive-border bg-immersive-card w-10 h-8 flex items-center justify-center text-xs rounded-lg select-none">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => updateCardStep(idx, e.target.value)}
                  className="flex-1 bg-immersive-bg border border-immersive-border text-immersive-text rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-immersive-accent transition-all animate-none"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-immersive-dim">Summary Take-Away</label>
            <textarea
              value={card.takeaway}
              rows={3}
              onChange={(e) => updateCardField('takeaway', e.target.value)}
              className="w-full bg-immersive-bg border border-immersive-border text-[#E0E0E6] rounded-lg p-2.5 text-xs focus:outline-none focus:border-immersive-accent resize-none leading-relaxed transition-all animate-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
