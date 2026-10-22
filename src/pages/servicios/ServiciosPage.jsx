import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Globe2,
  Target,
  Megaphone,
  BarChart3,
  Compass,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  ChevronDown,
  X,
  Radio,
  Music2,
  Users,
  ShieldCheck,
  Zap,
  Award,
  Calendar,
  Send,
  SlidersHorizontal
} from 'lucide-react';
import './ServiciosPage.css';
import { useLanguage } from '../../context/LanguageContext';

const WHATSAPP_NUMBER = '13104699872';

const buildWhatsappUrl = (serviceName, customMsg = '') => {
  const text = customMsg
    ? customMsg
    : `Hola DigitalLatino, estoy interesado en el servicio: "${serviceName}". Quisiera recibir más información.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
};

export default function ServiciosPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('promocion');
  const [openFaq, setOpenFaq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState('');
  
  // Modal Form State
  const [formData, setFormData] = useState({
    nombre: '',
    cancionArtista: '',
    servicio: 'Plan Artista Independiente',
    mensaje: ''
  });

  const handleOpenModal = (planName) => {
    setSelectedPlanForModal(planName);
    setFormData(prev => ({ ...prev, servicio: planName || 'Plan Artista Independiente' }));
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const msg = `Hola DigitalLatino, mi nombre es ${formData.nombre || 'Un Artista/Sello'}.` +
      (formData.cancionArtista ? ` Proyecto/Canción: ${formData.cancionArtista}.` : '') +
      ` Me interesa el servicio: ${formData.servicio}.` +
      (formData.mensaje ? ` Nota: ${formData.mensaje}` : '');

    window.open(buildWhatsappUrl(formData.servicio, msg), '_blank');
    setIsModalOpen(false);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="servicios-container">
      {/* Background Ambient Glow Effects */}
      <div className="servicios-glow-bg-1" />
      <div className="servicios-glow-bg-2" />
      <div className="servicios-glow-bg-3" />

      <div className="servicios-content-wrapper">
        
        {/* ─── HERO SECTION ────────────────────────────────────────── */}
        <section className="servicios-hero">
          <div className="servicios-hero-border-line" />

          <div className="servicios-badge">
            <Sparkles size={15} />
            {t('servicesBadge', 'NUESTROS SERVICIOS DIGITAL LATINO')}
          </div>

          <h1 className="servicios-hero-title">
            {t('servicesHeroTitle', 'Potenciamos el impacto de la música latina en la era digital')}
          </h1>

          <p className="servicios-hero-description">
            {t('servicesHeroDesc', 'Desde monitoreo de charts hasta estrategias avanzadas de promoción en TikTok, playlists y radios. Descubre nuestras soluciones diseñadas para artistas, sellos y equipos de management.')}
          </p>

          <div className="servicios-hero-actions">
            <button
              onClick={() => scrollToSection('planes-section')}
              className="servicios-btn-primary"
            >
              <Zap size={18} />
              {t('viewPlans', 'Ver Planes & Paquetes')}
            </button>
            <a
              href={buildWhatsappUrl('Asesoría General')}
              target="_blank"
              rel="noopener noreferrer"
              className="servicios-btn-secondary"
            >
              <MessageCircle size={18} style={{ color: '#25D366' }} />
              {t('talkToAdvisor', 'Hablar con un Asesor')}
            </a>
          </div>

          {/* Quick Nav Pills */}
          <div className="servicios-quick-nav">
            <button onClick={() => { setActiveTab('promocion'); scrollToSection('servicios-detalles'); }} className={`servicios-nav-pill ${activeTab === 'promocion' ? 'active' : ''}`}>
              <Megaphone size={14} /> {t('promoCampaignsTab', 'Promoción & Campañas')}
            </button>
            <button onClick={() => { setActiveTab('analitica'); scrollToSection('servicios-detalles'); }} className={`servicios-nav-pill ${activeTab === 'analitica' ? 'active' : ''}`}>
              <BarChart3 size={14} /> {t('dataAnalyticsTab', 'Data & Analítica')}
            </button>
            <button onClick={() => { setActiveTab('consultoria'); scrollToSection('servicios-detalles'); }} className={`servicios-nav-pill ${activeTab === 'consultoria' ? 'active' : ''}`}>
              <Compass size={14} /> {t('consultingTab', 'Consultoría & A&R')}
            </button>
            <button onClick={() => scrollToSection('planes-section')} className="servicios-nav-pill">
              <Zap size={14} /> {t('workModelsTitle', 'Planes')}
            </button>
            <button onClick={() => scrollToSection('faq-section')} className="servicios-nav-pill">
              ❓ {t('faqTitle', 'Preguntas Frecuentes')}
            </button>
          </div>
        </section>

        {/* ─── CORE PILLARS ────────────────────────────────────────── */}
        <section className="servicios-pillars-grid">
          <div className="servicios-pillar-card">
            <div className="servicios-pillar-icon-box" style={{ background: 'rgba(0, 229, 255, 0.12)', color: '#00e5ff' }}>
              <TrendingUp size={26} />
            </div>
            <h3 className="servicios-pillar-title">{t('realtimeAnalyticsTitle', 'Analítica en Tiempo Real')}</h3>
            <p className="servicios-pillar-desc">
              {t('realtimeAnalyticsDesc', 'Monitoreo continuo de playlists, creadores de TikTok y el comportamiento orgánico de tus canciones en las principales plataformas digitales.')}
            </p>
          </div>

          <div className="servicios-pillar-card">
            <div className="servicios-pillar-icon-box" style={{ background: 'rgba(138, 136, 255, 0.12)', color: '#8a88ff' }}>
              <Globe2 size={26} />
            </div>
            <h3 className="servicios-pillar-title">{t('multiterritorialTitle', 'Cobertura Multiterritorial')}</h3>
            <p className="servicios-pillar-desc">
              {t('multiterritorialDesc', 'Estrategias y datos hiperlocalizados adaptados a México, Colombia, Argentina, Estados Unidos (Latin) y toda Latinoamérica.')}
            </p>
          </div>

          <div className="servicios-pillar-card">
            <div className="servicios-pillar-icon-box" style={{ background: 'rgba(255, 0, 80, 0.12)', color: '#ff0050' }}>
              <Target size={26} />
            </div>
            <h3 className="servicios-pillar-title">{t('reachOptimizationTitle', 'Optimización de Alcance')}</h3>
            <p className="servicios-pillar-desc">
              {t('reachOptimizationDesc', 'Identificación precisa de creadores clave y curadores de playlists para maximizar el retorno de inversión de tu campaña promocional.')}
            </p>
          </div>
        </section>

        {/* ─── DETAILED SERVICES SHOWCASE (TABS) ────────────────────── */}
        <section id="servicios-detalles">
          <div className="servicios-section-header">
            <span className="servicios-section-subtitle">{language === 'en' ? 'COMPREHENSIVE SOLUTIONS' : 'SOLUCIONES INTEGRALES'}</span>
            <h2 className="servicios-section-title">{language === 'en' ? 'Our Key Expertise Areas' : 'Nuestras Áreas de Especialización'}</h2>
          </div>

          {/* Category Tabs Bar */}
          <div className="servicios-tabs-bar">
            <button
              className={`servicios-tab-btn ${activeTab === 'promocion' ? 'active' : ''}`}
              onClick={() => setActiveTab('promocion')}
            >
              <Megaphone size={18} />
              {t('promoCampaignsTab', 'Promoción & Campañas')}
            </button>

            <button
              className={`servicios-tab-btn ${activeTab === 'analitica' ? 'active' : ''}`}
              onClick={() => setActiveTab('analitica')}
            >
              <BarChart3 size={18} />
              {t('dataAnalyticsTab', 'Data & Analítica')}
            </button>

            <button
              className={`servicios-tab-btn ${activeTab === 'consultoria' ? 'active' : ''}`}
              onClick={() => setActiveTab('consultoria')}
            >
              <Compass size={18} />
              {t('consultingTab', 'Consultoría & Management')}
            </button>
          </div>

          {/* TAB 1: PROMOCIÓN & CAMPAÑAS */}
          {activeTab === 'promocion' && (
            <div className="servicios-details-grid">
              {/* Card 1: Marketing Plan & Strategy Development */}
              <div className="servicios-detail-card">
                <div>
                  <div className="servicios-card-top-tag" style={{ background: 'rgba(255, 0, 80, 0.15)', color: '#ff0050' }}>
                    <Megaphone size={13} /> MARKETING PLAN & STRATEGY DEVELOPMENT
                  </div>
                  <h3 className="servicios-card-title">
                    {language === 'en' ? 'Marketing Plan & Strategy Development' : 'Estrategia & Marketing Digital Musical'}
                  </h3>
                  <p className="servicios-card-desc">
                    {language === 'en'
                      ? 'Data-driven 360° marketing strategies engineered for music releases. We execute targeted Meta Ads campaigns and curated playlist placement to maximize organic reach and fan conversion.'
                      : 'Diseñamos e implementamos planes estratégicos 360° a la medida de tu lanzamiento. Conectamos tu música con la audiencia correcta mediante pauta optimizada en Meta Ads y placement en playlists.'}
                  </p>

                  <ul className="servicios-features-list">
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Strategic project evaluation & target audience diagnostics.' : 'Evaluación estratégica de proyecto y diagnóstico de audiencia objetivo.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? '360° release action plan & targeted advertising schedule.' : 'Plan de acción 360° y calendario de pauta publicitaria.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'High-converting Meta Ads (Instagram & Facebook) setup.' : 'Campañas optimizadas en Meta Ads (Instagram y Facebook).'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Placement and pitching across DigitalLatino’s playlist network.' : 'Inserción y pitching directo en la red de playlists DigitalLatino.'}</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenModal(language === 'en' ? 'Marketing Plan & Strategy Development' : 'Estrategia & Marketing Digital Musical')}
                  className="servicios-card-action-btn"
                >
                  <span>{language === 'en' ? 'Request Custom Strategy' : 'Solicitar Propuesta Personalizada'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Card 2: AI-Powered Influencer Marketing */}
              <div className="servicios-detail-card">
                <div>
                  <div className="servicios-card-top-tag" style={{ background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff' }}>
                    <Users size={13} /> AI-POWERED INFLUENCER MARKETING
                  </div>
                  <h3 className="servicios-card-title">
                    {language === 'en' ? 'AI-Powered Influencer Marketing' : 'Campañas con Influencers & TikTok AI'}
                  </h3>
                  <p className="servicios-card-desc">
                    {language === 'en'
                      ? 'Amplify your tracks through verified TikTok creators. Powered by AI matching algorithms, we identify high-converting profiles to generate authentic engagement and organic viral trends.'
                      : 'Impulsamos tus canciones con creadores verificados de TikTok. Utilizamos algoritmos de inteligencia artificial para seleccionar los perfiles de mayor engagement y generar tendencia orgánica.'}
                  </p>

                  <ul className="servicios-features-list">
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'AI-driven creator selection matched by genre, niche, and country.' : 'Selección asistida por IA de creadores por género, nicho y territorio.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'End-to-end management: Pitching, briefs, and content execution.' : 'Gestión integral: Pitching, coordinación de briefs y supervisión de contenido.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Anti-bot verification guaranteeing 100% real audience engagement.' : 'Auditoría anti-bot para garantizar audiencias 100% reales.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Real-time impact tracking: Views, saves, sound usage & search trends.' : 'Medición en tiempo real: Vistas, guardados, creaciones de sonido y búsquedas.'}</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenModal(language === 'en' ? 'AI-Powered Influencer Marketing' : 'Campañas con Influencers TikTok AI')}
                  className="servicios-card-action-btn"
                >
                  <span>{language === 'en' ? 'Launch TikTok Campaign' : 'Solicitar Campaña TikTokers'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DATA & ANALÍTICA */}
          {activeTab === 'analitica' && (
            <div className="servicios-details-grid">
              {/* Card 3: Online Media & Web Monitoring */}
              <div className="servicios-detail-card">
                <div>
                  <div className="servicios-card-top-tag" style={{ background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff' }}>
                    <Radio size={13} /> ONLINE MEDIA & WEB MONITORING
                  </div>
                  <h3 className="servicios-card-title">
                    {language === 'en' ? 'Online Media & Web Monitoring' : 'Monitoreo de Radio & Medios Digitales'}
                  </h3>
                  <p className="servicios-card-desc">
                    {language === 'en'
                      ? 'Comprehensive real-time tracking of your track’s footprint. Monitor FM & digital radio airplay, playlist placements, and TikTok sound trends in a unified dashboard.'
                      : 'Rastreamos la presencia de tu música en tiempo real. Monitoreamos rotación en emisoras de radio FM/Digital, adiciones a playlists y comportamiento en TikTok en un solo panel.'}
                  </p>

                  <ul className="servicios-features-list">
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Real-time airplay detection across FM & digital radio (LATAM & US Latin).' : 'Detección en tiempo real de tocadas en estaciones de radio (LATAM & US Latin).'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Daily playlist placement monitoring & chart movement tracking.' : 'Monitoreo diario de posicionamiento en playlists y evolución en charts.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? '"Radio vs Digital" comparative reporting for ROI assessment.' : 'Reportes comparativos "Radio vs Digital" para evaluar rendimiento e impacto.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Automated radio programmer alerts upon streaming viral spikes.' : 'Alertas automatizadas a programadores radiales ante picos de viralidad.'}</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenModal(language === 'en' ? 'Online Media & Web Monitoring' : 'Monitoreo de Radio & Medios Digitales')}
                  className="servicios-card-action-btn"
                >
                  <span>{language === 'en' ? 'Inquire for Media Monitoring' : 'Consultar por Monitoreo de Medios'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Card 4: Market Intelligence & Analytics */}
              <div className="servicios-detail-card">
                <div>
                  <div className="servicios-card-top-tag" style={{ background: 'rgba(138, 136, 255, 0.15)', color: '#8a88ff' }}>
                    <BarChart3 size={13} /> MARKET INTELLIGENCE & ANALYTICS
                  </div>
                  <h3 className="servicios-card-title">{language === 'en' ? 'Market Intelligence & Music Analytics' : 'Inteligencia de Mercado Musical'}</h3>
                  <p className="servicios-card-desc">
                    {language === 'en'
                      ? 'We turn millions of digital streaming interactions into actionable market intelligence to power data-driven decisions for your catalog.'
                      : 'Transformamos millones de interacciones digitales en insights accionables para la toma de decisiones estratégicas de tu proyecto o catálogo.'}
                  </p>

                  <ul className="servicios-features-list">
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Digital charts & viral trend discovery by territory.' : 'Charts digitales y análisis de tendencias virales por territorio.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Comparative benchmarks against similar artists & releases.' : 'Benchmarks comparativos contra artistas y lanzamientos similares.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Demographic listener mapping by target country and city.' : 'Mapeo demográfico de oyentes por país y ciudad target.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'AI-powered stream growth & catalog valuation projections.' : 'Proyecciones de consumo y valor de catálogo con IA.'}</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenModal(language === 'en' ? 'Market Intelligence & Analytics' : 'Inteligencia de Mercado Musical')}
                  className="servicios-card-action-btn"
                >
                  <span>{language === 'en' ? 'Explore Analytics Platform' : 'Explorar Plataforma / Ventas'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CONSULTORÍA & MANAGEMENT */}
          {activeTab === 'consultoria' && (
            <div className="servicios-details-grid">
              <div className="servicios-detail-card">
                <div>
                  <div className="servicios-card-top-tag" style={{ background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff' }}>
                    <Compass size={13} /> A&R & STRATEGIC CONSULTING
                  </div>
                  <h3 className="servicios-card-title">{language === 'en' ? 'A&R & Strategic Consulting' : 'Acompañamiento Estratégico & A&R'}</h3>
                  <p className="servicios-card-desc">
                    {language === 'en'
                      ? 'Specialized advisory services to optimize your release strategy before, during, and after release day.'
                      : 'Asesoría especializada para optimizar la cadena de valor de tus lanzamientos antes, durante y después del estreno.'}
                  </p>

                  <ul className="servicios-features-list">
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Comprehensive digital presence & artist profile audit.' : 'Auditoría integral de presencia digital y perfiles de artista.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Strategic release calendar & distribution window planning.' : 'Planificación de calendario de lanzamientos y ventanas estratégicas.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Pitching press kit & promotional asset preparation.' : 'Preparación de press kits, carpetas de pitching y material promocional.'}</span>
                    </li>
                    <li className="servicios-feature-item">
                      <CheckCircle2 size={16} className="servicios-feature-check" />
                      <span>{language === 'en' ? 'Fanbase growth & audience retention strategy.' : 'Estrategia de crecimiento de audiencia y fidelización de fans.'}</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenModal(language === 'en' ? 'A&R & Strategic Consulting' : 'Agendar Consultoría A&R')}
                  className="servicios-card-action-btn"
                >
                  <span>{language === 'en' ? 'Book A&R Consultation' : 'Agendar Consultoría'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ─── PRICING / PLANS SECTION ──────────────────────────────── */}
        <section id="planes-section" className="servicios-plans-container">
          <div className="servicios-section-header">
            <span className="servicios-section-subtitle">{t('workModelsTitle', 'MODELOS DE TRABAJO')}</span>
            <h2 className="servicios-section-title">{t('plansSubtitle', 'Elige el plan que mejor se adapte a tu proyecto')}</h2>
          </div>

          <div className="servicios-plans-grid">
            
            {/* PLAN 1 */}
            <div className="servicios-plan-card">
              <div className="servicios-plan-header">
                <h3 className="servicios-plan-name">{t('indiePlanName', 'Plan Artista Independiente')}</h3>
                <p className="servicios-plan-for">{t('indiePlanFor', 'Ideal para lanzamientos puntuales de sencillos o EPs.')}</p>
              </div>

              <div>
                <p className="servicios-plan-features-title">{t('whatIncludes', 'LO QUE INCLUYE:')}</p>
                <ul className="servicios-plan-features">
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#00e5ff', flexShrink: 0 }} />
                    <span>{language === 'en' ? 'TikTok creator campaign (3 to 5 vetted creators).' : 'Campaña con TikTokers creadores (3 a 5 creadores filtrados).'}</span>
                  </li>
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#00e5ff', flexShrink: 0 }} />
                    <span>{language === 'en' ? 'Pitching to independent playlist curators.' : 'Pitching a curadores de playlists independientes.'}</span>
                  </li>
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#00e5ff', flexShrink: 0 }} />
                    <span>{language === 'en' ? 'Final reach and impact analytics report.' : 'Reporte final de impacto y alcance obtenido.'}</span>
                  </li>
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#00e5ff', flexShrink: 0 }} />
                    <span>{language === 'en' ? '30-day post-release monitoring on DigitalLatino.' : 'Monitoreo en DigitalLatino por 30 días post-estreno.'}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenModal(t('indiePlanName', 'Plan Artista Independiente'))}
                className="servicios-plan-btn outline"
              >
                {t('checkPrice', 'Consultar Precio')}
              </button>
            </div>

            {/* PLAN 2 (DESTACADO / SELLO) */}
            <div className="servicios-plan-card popular">
              <div className="servicios-plan-popular-badge">
                {t('mostRecommended', 'MÁS RECOMENDADO')}
              </div>

              <div className="servicios-plan-header">
                <h3 className="servicios-plan-name">{t('labelPlanName', 'Plan Sello / Management')}</h3>
                <p className="servicios-plan-for">{t('labelPlanFor', 'Para sellos discográficos y agencias con flujo constante de lanzamientos.')}</p>
              </div>

              <div>
                <p className="servicios-plan-features-title">{t('whatIncludes', 'LO QUE INCLUYE:')}</p>
                <ul className="servicios-plan-features">
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#8a88ff', flexShrink: 0 }} />
                    <span>{language === 'en' ? 'Full access to DigitalLatino Analytics platform.' : 'Acceso completo a la plataforma de Analítica DigitalLatino.'}</span>
                  </li>
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#8a88ff', flexShrink: 0 }} />
                    <span>{language === 'en' ? 'Recurring monthly TikTok & playlist campaigns.' : 'Campañas recurrentes en TikTokers y Playlists por mes.'}</span>
                  </li>
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#8a88ff', flexShrink: 0 }} />
                    <span>{language === 'en' ? 'Dedicated A&R assistant & monthly strategy consulting.' : 'Asistente dedicado de A&R y consultoría mensual.'}</span>
                  </li>
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#8a88ff', flexShrink: 0 }} />
                    <span>{language === 'en' ? 'Priority 24/7 support and early feature previews.' : 'Soporte prioritario 24/7 y acceso a previews.'}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenModal(t('labelPlanName', 'Plan Sello / Management'))}
                className="servicios-plan-btn primary"
              >
                {t('talkToAdvisor', 'Hablar con un Asesor')}
              </button>
            </div>

            {/* PLAN 3 */}
            <div className="servicios-plan-card">
              <div className="servicios-plan-header">
                <h3 className="servicios-plan-name">{t('customPlanName', 'Plan A la Medida')}</h3>
                <p className="servicios-plan-for">{t('customPlanFor', 'Para proyectos prioritarios, alianzas de marca o giras de medios internacionales.')}</p>
              </div>

              <div>
                <p className="servicios-plan-features-title">{t('whatIncludes', 'LO QUE INCLUYE:')}</p>
                <ul className="servicios-plan-features">
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#ff0050', flexShrink: 0 }} />
                    <span>{language === 'en' ? 'Full 360° strategy (Radio + Digital + TikTokers).' : 'Estrategia 360° integrada (Radio + Digital + TikTokers).'}</span>
                  </li>
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#ff0050', flexShrink: 0 }} />
                    <span>{language === 'en' ? 'Tier 1 Macro-influencer creator network.' : 'Red de creadores de alto alcance (Tier 1 Macro-influencers).'}</span>
                  </li>
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#ff0050', flexShrink: 0 }} />
                    <span>{language === 'en' ? 'Tailored multiterritorial coverage (LATAM & US Latin).' : 'Cobertura multiterritorial personalizada (LATAM & US Latin).'}</span>
                  </li>
                  <li className="servicios-plan-feature-item">
                    <CheckCircle2 size={16} style={{ color: '#ff0050', flexShrink: 0 }} />
                    <span>{language === 'en' ? 'Exclusive account director & strategist.' : 'Director de cuenta y estrategia dedicado exclusivamente.'}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleOpenModal(t('customPlanName', 'Plan A la Medida (Custom 360)'))}
                className="servicios-plan-btn outline"
              >
                {t('designMyPlan', 'Diseñar mi Plan')}
              </button>
            </div>

          </div>
        </section>

        {/* ─── WHY CHOOSE US ────────────────────────────────────────── */}
        <section style={{ marginBottom: '4.5rem' }}>
          <div className="servicios-section-header">
            <span className="servicios-section-subtitle">{language === 'en' ? 'WHY US' : 'DIFERENCIADORES'}</span>
            <h2 className="servicios-section-title">{t('whyTitle', '¿Por qué elegir DigitalLatino?')}</h2>
          </div>

          <div className="servicios-why-grid">
            <div className="servicios-why-card">
              <div className="servicios-why-num">01</div>
              <h4 className="servicios-why-title">{t('latinSpecializationTitle', 'Especialización en Música Latina')}</h4>
              <p className="servicios-why-desc">
                {t('latinSpecializationDesc', 'Entendemos las dinámicas culturales y patrones de consumo específicos de cada región de LATAM y el mercado latino en EE. UU.')}
              </p>
            </div>

            <div className="servicios-why-card">
              <div className="servicios-why-num">02</div>
              <h4 className="servicios-why-title">{t('totalTransparencyTitle', 'Transparencia Total en Datos')}</h4>
              <p className="servicios-why-desc">
                {t('totalTransparencyDesc', 'Sin métricas infladas ni falsas promesas. Todos nuestros reportes se basan en datos verificados de consumo y engagement orgánico.')}
              </p>
            </div>

            <div className="servicios-why-card">
              <div className="servicios-why-num">03</div>
              <h4 className="servicios-why-title">{t('verifiedNetworkTitle', 'Red de Creadores Verificada')}</h4>
              <p className="servicios-why-desc">
                {t('verifiedNetworkDesc', 'Trabajamos exclusivamente con curadores y creadores previamente filtrados por calidad de audiencia y autenticidad de interacciones.')}
              </p>
            </div>

            <div className="servicios-why-card">
              <div className="servicios-why-num">04</div>
              <h4 className="servicios-why-title">{t('fastExecutionTitle', 'Agilidad en la Ejecución')}</h4>
              <p className="servicios-why-desc">
                {t('fastExecutionDesc', 'Activación rápida de campañas en un plazo de 48 a 72 horas hábiles post-aprobación de la estrategia de lanzamiento.')}
              </p>
            </div>
          </div>
        </section>

        {/* ─── FAQ ACCORDION ────────────────────────────────────────── */}
        <section id="faq-section" className="servicios-faq-container">
          <div className="servicios-section-header">
            <span className="servicios-section-subtitle">{t('faqSubtitle', 'Resolvemos tus dudas')}</span>
            <h2 className="servicios-section-title">{t('faqTitle', 'Preguntas Frecuentes')}</h2>
          </div>

          <div className={`servicios-faq-item ${openFaq === 0 ? 'open' : ''}`}>
            <div className="servicios-faq-header" onClick={() => toggleFaq(0)}>
              <span className="servicios-faq-question">
                {language === 'en'
                  ? 'How far in advance should I book a campaign?'
                  : '¿Con cuánta anticipación debo contratar una campaña?'}
              </span>
              <ChevronDown className="servicios-faq-icon" size={20} style={{ transform: openFaq === 0 ? 'rotate(180deg)' : 'none' }} />
            </div>
            {openFaq === 0 && (
              <div className="servicios-faq-answer">
                {language === 'en'
                  ? 'We recommend booking at least 2 weeks prior to release date to prepare pre-saves, audit TikTok creators, and coordinate optimal playlist pitching.'
                  : 'Recomendamos contratar con al menos 2 semanas de anticipación a la fecha del lanzamiento para coordinar la etapa de pre-save, auditar creadores de TikTok y preparar el pitching óptimo a curadores.'}
              </div>
            )}
          </div>

          <div className={`servicios-faq-item ${openFaq === 1 ? 'open' : ''}`}>
            <div className="servicios-faq-header" onClick={() => toggleFaq(1)}>
              <span className="servicios-faq-question">
                {language === 'en'
                  ? 'Can I hire TikTok or Playlist services separately?'
                  : '¿Puedo contratar solo el servicio de TikTok o Playlists por separado?'}
              </span>
              <ChevronDown className="servicios-faq-icon" size={20} style={{ transform: openFaq === 1 ? 'rotate(180deg)' : 'none' }} />
            </div>
            {openFaq === 1 && (
              <div className="servicios-faq-answer">
                {language === 'en'
                  ? 'Yes! All our services can be booked individually or bundled together according to your budget and strategy.'
                  : '¡Sí! Todos nuestros servicios se pueden adquirir de forma individual o en paquete promocional, ajustándose a la estrategia y presupuesto de tu proyecto musical.'}
              </div>
            )}
          </div>

          <div className={`servicios-faq-item ${openFaq === 2 ? 'open' : ''}`}>
            <div className="servicios-faq-header" onClick={() => toggleFaq(2)}>
              <span className="servicios-faq-question">
                {language === 'en'
                  ? 'How are performance reports delivered?'
                  : '¿Cómo entregan los reportes de resultados?'}
              </span>
              <ChevronDown className="servicios-faq-icon" size={20} style={{ transform: openFaq === 2 ? 'rotate(180deg)' : 'none' }} />
            </div>
            {openFaq === 2 && (
              <div className="servicios-faq-answer">
                {language === 'en'
                  ? 'You will have live analytics access inside the DigitalLatino platform, and upon campaign completion, you will receive a consolidated executive PDF report.'
                  : 'Tendrás acceso a métricas en vivo dentro de la plataforma DigitalLatino durante la vigencia de la campaña, y al finalizar recibirás un informe ejecutivo consolidado en PDF con análisis de rendimiento y conversión.'}
              </div>
            )}
          </div>

          <div className={`servicios-faq-item ${openFaq === 3 ? 'open' : ''}`}>
            <div className="servicios-faq-header" onClick={() => toggleFaq(3)}>
              <span className="servicios-faq-question">
                {language === 'en'
                  ? 'Do you work with artists from any music genre?'
                  : '¿Trabajan con artistas de cualquier género musical?'}
              </span>
              <ChevronDown className="servicios-faq-icon" size={20} style={{ transform: openFaq === 3 ? 'rotate(180deg)' : 'none' }} />
            </div>
            {openFaq === 3 && (
              <div className="servicios-faq-answer">
                {language === 'en'
                  ? 'We specialize primarily in Latin music (Urbano, Reggaeton, Latin Pop, Regional Mexican, Tropical, Indie Latin, Electro Latin, and subgenres).'
                  : 'Nos especializamos principalmente en música latina (Urbano, Reggaetón, Pop Latino, Regional Mexicano, Tropical, Indie Latin, Electro Latin y derivados), permitiendo un conocimiento hiperprofundo del mercado objetivo.'}
              </div>
            )}
          </div>
        </section>

        {/* ─── FINAL CTA BANNER ─────────────────────────────────────── */}
        <section className="servicios-cta-banner">
          <h2 className="servicios-cta-title">
            {t('readyTitle', '¿Listo para llevar tu música al siguiente nivel?')}
          </h2>
          <p className="servicios-cta-desc">
            {t('readyDesc', 'Ponte en contacto con nuestro equipo para diseñar la mejor estrategia personalizada para tu próximo estreno o catálogo.')}
          </p>

          <div className="servicios-cta-buttons">
            <a
              href={buildWhatsappUrl('Estrategia Personalizada')}
              target="_blank"
              rel="noopener noreferrer"
              className="servicios-btn-primary"
            >
              <MessageCircle size={20} />
              {t('contactWhatsapp', 'Contactar por WhatsApp')}
            </a>
            <button
              onClick={() => handleOpenModal('Consulta General')}
              className="servicios-btn-secondary"
            >
              <Send size={18} />
              {t('sendRequest', 'Enviar Mensaje / Solicitud')}
            </button>
          </div>
        </section>

      </div>

      {/* ─── CONTACT MODAL ────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="servicios-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="servicios-modal-panel">
            <button
              className="servicios-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={18} />
            </button>

            <h3 className="servicios-modal-title">{t('requestProposalModal', 'Solicitar Propuesta')}</h3>
            <p className="servicios-modal-sub">
              {t('modalSub', 'Completa los datos para iniciar la conversación por WhatsApp con nuestro equipo.')}
            </p>

            <form onSubmit={handleFormSubmit}>
              <div className="servicios-form-group">
                <label className="servicios-form-label">{t('yourNameLabel', 'Tu Nombre o Nombre de Agencia / Sello')}</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza / Sello Latino"
                  className="servicios-form-input"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div className="servicios-form-group">
                <label className="servicios-form-label">{t('artistSongLabel', 'Nombre del Artista o Canción (Opcional)')}</label>
                <input
                  type="text"
                  placeholder="Ej. Artista X - Sencillo Verano"
                  className="servicios-form-input"
                  value={formData.cancionArtista}
                  onChange={e => setFormData({ ...formData, cancionArtista: e.target.value })}
                />
              </div>

              <div className="servicios-form-group">
                <label className="servicios-form-label">{t('serviceInterestLabel', 'Servicio de Interés')}</label>
                <select
                  className="servicios-form-select"
                  value={formData.servicio}
                  onChange={e => setFormData({ ...formData, servicio: e.target.value })}
                >
                  <option value="Plan Artista Independiente">Plan Artista Independiente</option>
                  <option value="Plan Sello / Management">Plan Sello / Management</option>
                  <option value="Plan A la Medida (Custom 360)">Plan A la Medida (Custom 360°)</option>
                  <option value="Campañas de Posicionamiento Musical">Campañas de Posicionamiento Musical</option>
                  <option value="Estrategia Digital Hits for Radio">Estrategia Digital Hits for Radio</option>
                  <option value="Acceso a Inteligencia de Mercado Musical">Inteligencia de Mercado / Analítica</option>
                  <option value="Agendar Consultoría A&R">Consultoría & Management A&R</option>
                </select>
              </div>

              <div className="servicios-form-group">
                <label className="servicios-form-label">{t('commentsLabel', 'Detalles o Comentarios Adicionales')}</label>
                <textarea
                  rows={3}
                  placeholder={language === 'en' ? 'Write any details on launch date or estimated budget...' : 'Escribe aquí cualquier detalle de fecha de lanzamiento o presupuesto estimativo...'}
                  className="servicios-form-textarea"
                  value={formData.mensaje}
                  onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="servicios-plan-btn primary"
                style={{ marginTop: '1rem' }}
              >
                <MessageCircle size={18} />
                {t('continueWhatsapp', 'Continuar a WhatsApp')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
