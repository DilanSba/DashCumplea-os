/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar as CalendarIcon, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Heart, 
  ChevronRight,
  Filter,
  Cake,
  X,
  Info,
  Settings,
  Download,
  Star,
  Sparkles,
  Moon,
  Sun,
  Bell,
  BellOff,
  LayoutGrid,
  List,
  Plus
} from 'lucide-react';

// --- Types ---

interface Employee {
  id: string;
  area: string;
  nombre: string;
  correo: string;
  mes: string;
  mesNum: number;
  dia: number;
  contactoEmergencia: string;
  numeroAlterno: string;
  pariente: string;
  extension: string;
  talla: string;
  foto?: string;
  customFields?: { label: string, value: string }[];
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DEFAULT_MONTH_COLORS: Record<string, string> = {
  'Enero': '#FF3366',      // Vibrant Pink
  'Febrero': '#7000FF',    // Electric Purple
  'Marzo': '#00F5D4',      // Bright Teal
  'Abril': '#FEE440',      // Sunny Yellow
  'Mayo': '#00BBF9',       // Sky Blue
  'Junio': '#FF4D6D',      // Coral
  'Julio': '#9EF01A',      // Lime
  'Agosto': '#FF9E00',     // Bright Orange
  'Septiembre': '#3A0CA3', // Deep Indigo
  'Octubre': '#F15BB5',    // Hot Pink
  'Noviembre': '#00F5D4',  // Mint
  'Diciembre': '#9B5DE5',  // Lavender
};

// --- Components ---

const CelebrationItem: React.FC<{ x: number, y: number, color: string, emoji: string, onComplete: () => void }> = ({ x, y, color, emoji, onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 0, x: x - 15, y: y - 15 }}
      animate={{ 
        opacity: 0, 
        scale: [1, 1.5, 1], 
        y: y - 500,
        x: x - 15 + (Math.random() * 200 - 100),
        rotate: Math.random() * 360
      }}
      transition={{ duration: 3, ease: "easeOut" }}
      onAnimationComplete={onComplete}
      className="fixed pointer-events-none z-[100] text-4xl"
      style={{ color }}
    >
      {emoji}
    </motion.div>
  );
};

const rawCsv = `ÁREA,NOMBRE,CORREO,MES,DIA,CONTACTO DE EMERGENCIA ,NUMERO ALTERNO,PARIENTE,EXTENSIÓN,TALLAS
Florida,Diana Carolina Velasquez Rincon,d.velasquez@windmarhome.com,Abril,30,Claudia Rincón,3115828980,Madre,197,S
Florida,Bryan Smith Jimenez Peña,b.jimenez@windmarhome.com,Diciembre,20,Angie Katherine Garzon,3105837185,Pareja,345,M
Florida,David Joel Santana Reyes,d.santana@windmarhome.com,Diciembre,29,Lorena Reyes,3184043298,Madre,123,M
Florida,Bayron Andres Diaz Figueroa,b.diaz@windmarhome.com,Febrero,1,Richard Dia,3017423446,Hermano,142,L
Florida,Karol Andrea Martinez Catellanos,Karol.martinez@windmarhome.com,Julio,3,Adriana Castellanos,3184534369,Madre,169,S
Florida,Reinel Esteban Molina,r.molina@windmarhome.com,Junio,9,Patricia,3184197527,Madre,143,M
Florida,Salma Valentina Burbano Barahona,s.burbano@windmarhome.com,Marzo,16,Bibiana Barahona,3116228884,Madre,202,M
Florida,Yurubi Angelica Bonilla Castellar,y.bonilla@windmarhome.com,Mayo,15,Rubis Castellar,3113951350,Tia,201,M
Florida,David Santiago Lizcano Rodriguez,d.lizcano@windmarhome.com,Noviembre,22,Daniel Bohorquez,3212854179,Primo,159,L
Florida,Julian Mateo Cajamarca Leon,j.cajamarca@windmarhome.com,Octubre,18,Esperanza Medina,3008589331,Pareja,203,L
Project M,Andres Felipe Rengifo Sanchez,a.rengifo@windmarhome.com,Mayo,23,,,,104,M
Telemercadeo FL,Isabella Espejo Munoz,i.espejo@windmarhome.com,Febrero,22,Miguel Angel Rivera,3505668502,Pareja,465,L
Telemercadeo FL,Avelino Rubiano Vargas,a.rubiano@windmarhome.com,Septiembre,9,Lizeth Fernanda Muñoz,313 609 0506,Hermana,567,M
Telemercadeo PR,Juan Pablo Penagos Parra,j.penagos@windmarhome.com,Abril,8,Cielo Parra Reyes,313 413 3833,Madre,278,M
Telemercadeo PR,Laura Natalie Gomez Melgarejo,laura.gomez@windmarhome.com,Abril,18,Verónica Melgarejo,311 474 6518,Madre,426,M
Telemercadeo PR,Santiago Felipe Riveros Salamanca,s.riveros@windmarhome.com,Abril,27,Marcela Riveros,3168928522,Tía,198,L
Telemercadeo PR,Ana Castellanos,a.castellanos@windmarhome.com,Agosto,26,Jose David Castellanos,321 450 7205,Hermano,294,M
Telemercadeo PR,Daniela Cano Ortega,d.cano@windmarhome.com,Diciembre,19,Alba Ines Ortega,301 226 3643,Madre,462,M
Telemercadeo PR,Brandon Steven Dominguez Ramos,b.dominguez@windmarhome.com,Enero,30,Viviana Leon,3014445493,Pareja,477,L
Telemercadeo PR,Nicol Daniela Gonzalez Rocha,nicol.g@windmarhome.com,Febrero,2,Angela Rocha,3024339979,Madre,388,S
Telemercadeo PR,Dilan Steveen Buitrago Aparicio,d.buitrago@windmarhome.com,Julio,28,Jenny Aparicio,320 824 1328,Madre,472,M
Telemercadeo PR,Lized Alejandra Perez Gomez,lized.perez@windmarhome.com,Julio,10,Mabel Gomez,320 923 2838,Madre,671,M
Telemercadeo PR,Diana Paola Riaño,d.riano@windmarhome.com,Septiembre,7,Fabiola Peñaloza,314 390 0433,Madre,366,M
VASS,Maria Fernanda Castaño Rengifo,m.castano@windmarhome.com,Agosto,28,Nancy Bulla,3205046370,Abuela,299,M
VASS,Santiago Vargas Ahumada,santiago.v@windmarhome.com,Julio,26,Yessica Calderon,3102705448,Pareja,409,L
VASS,Maria Paula Vargas Torres,maria.paula@windmarhome.com,Junio,27,Jenny Pilar Torres Bohorquez,3102925626,Madre,356,M
VASS,Angel David Ladino Quintero,a.ladino@windmarhome.com,Mayo,15,Valentina Garcia,3138051909,Pareja,253,M
VASS,Laura Valentina Guarnizo Bahamon,l.guarnizo@windmarhome.com,Noviembre,16, Julio Enrique Cortes,3007972404,Pareja,322,M
VASS,Santiago Reina Mejia,s.reina@windmarhome.com,Septiembre,26,Bibiana Mercedes Mejia ,3105623963,Madre,158,M
Ventas,Cristian Leonardo Castro Guerrero,c.castro@windmarhome.com,Febrero,21,,,,447,M
Ventas,Leslie Tatiana Peña Ortiz,leslie.pena@windmarhome.com,Febrero,24,Nicolas Guarín,3134219553,Pareja,395,S
Ventas,Juan Sebastian Rivera Joven,juan.s@windmarhome.com,Noviembre,23,Olga lucia joven rodriguez,3167249912,Madre,454,XXL
Ventas,Jesus Alberto Castro Sierra,jesus.castro@windmarhome.com,Septiembre,20,Ruben Dario Castro,3177695850,Hermano,300,M`;

// --- Helpers ---

const formatDisplayName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 4) return parts.slice(0, 3).join(' ');
  if (parts.length === 3) return parts.slice(0, 2).join(' ');
  return name;
};

const parseEmployees = (csv: string): Employee[] => {
  const lines = csv.split('\n');
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',');
    const rawMes = values[3]?.trim() || '';
    const mes = rawMes.charAt(0).toUpperCase() + rawMes.slice(1).toLowerCase();
    const mesNum = MONTHS_ES.indexOf(mes) + 1;
    
    const nombre = values[1]?.trim() || '';
    let foto;
    if (nombre.toLowerCase().includes('laura natalie gomez')) {
      foto = 'https://i.postimg.cc/x1PJj62t/Image-(1).jpg';
    }
    if (nombre.toLowerCase().includes('santiago felipe riveros')) {
      foto = '/talentos/santiago-felipe-riveros.jpg';
    }
    if (nombre.toLowerCase().includes('diana carolina velasquez')) {
      foto = '/talentos/diana-carolina-velasquez.png';
    }

    return {
      id: `emp-${index}`,
      area: values[0]?.trim() || '',
      nombre,
      correo: values[2]?.trim() || '',
      mes,
      mesNum,
      dia: parseInt(values[4]?.trim() || '0'),
      contactoEmergencia: values[5]?.trim() || '',
      numeroAlterno: values[6]?.trim() || '',
      pariente: values[7]?.trim() || '',
      extension: values[8]?.trim() || '',
      talla: values[9]?.trim() || '',
      foto,
    };
  }).filter(emp => emp.nombre && emp.mesNum > 0);
};

const getZodiacSign = (day: number, month: number) => {
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'Acuario', symbol: '♒', icon: '🏺', element: 'Aire', color: '#06B6D4' };
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { name: 'Piscis', symbol: '♓', icon: '🐟', element: 'Agua', color: '#14B8A6' };
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'Aries', symbol: '♈', icon: '🐏', element: 'Fuego', color: '#EF4444' };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'Tauro', symbol: '♉', icon: '🐂', element: 'Tierra', color: '#10B981' };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: 'Géminis', symbol: '♊', icon: '👥', element: 'Aire', color: '#F59E0B' };
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: 'Cáncer', symbol: '♋', icon: '🦀', element: 'Agua', color: '#3B82F6' };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'Leo', symbol: '♌', icon: '🦁', element: 'Fuego', color: '#F97316' };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'Virgo', symbol: '♍', icon: '🌾', element: 'Tierra', color: '#84CC16' };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: 'Libra', symbol: '♎', icon: '⚖️', element: 'Aire', color: '#0EA5E9' };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: 'Escorpio', symbol: '♏', icon: '🦂', element: 'Agua', color: '#A855F7' };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: 'Sagitario', symbol: '♐', icon: '🏹', element: 'Fuego', color: '#EC4899' };
  return { name: 'Capricornio', symbol: '♑', icon: '🐐', element: 'Tierra', color: '#64748B' };
};

// --- Components ---

const Modal = ({ employee, onClose, onEdit, monthColors, isDarkMode }: { employee: Employee | null, onClose: () => void, onEdit: (emp: Employee) => void, monthColors: Record<string, string>, isDarkMode: boolean }) => {
  if (!employee) return null;

  const color = monthColors[employee.mes] || '#1D429B';
  const zodiac = getZodiacSign(employee.dia, employee.mesNum);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231F20]/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        layoutId={employee.id}
        className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-[#A7A9AC]/30'} w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border transition-colors duration-500`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-32 relative" style={{ backgroundColor: color }}>
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => onEdit(employee)}
              className="p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
              title="Editar"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className={`absolute -bottom-12 left-8 p-1 ${isDarkMode ? 'bg-[#1E293B]' : 'bg-white'} rounded-full shadow-sm transition-colors duration-500`}>
            {employee.foto ? (
              <img 
                src={employee.foto} 
                alt={employee.nombre}
                className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {employee.nombre.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <h2 className={`text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-[#231F20]'} mb-1 transition-colors`}>{employee.nombre}</h2>
          <div 
            className="flex items-center gap-2 text-sm mb-6 font-bold"
            style={{ color: color }}
          >
            <Cake className="w-4 h-4" />
            <span>{employee.dia} de {employee.mes}</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-[#F8FAFC]'} transition-colors`}>
                <MapPin className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-[#6D6E71]'}`} />
              </div>
              <div>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-[#6D6E71]'} uppercase tracking-wider font-bold transition-colors`}>Área</p>
                <p className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-[#231F20]'} transition-colors`}>{employee.area}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-[#F8FAFC]'} transition-colors`}>
                <Mail className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-[#6D6E71]'}`} />
              </div>
              <div>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-[#6D6E71]'} uppercase tracking-wider font-bold transition-colors`}>Correo</p>
                <p className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-[#231F20]'} break-all transition-colors`}>{employee.correo}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-[#F8FAFC]'} transition-colors`}>
                <Phone className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-[#6D6E71]'}`} />
              </div>
              <div>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-[#6D6E71]'} uppercase tracking-wider font-bold transition-colors`}>Extensión</p>
                <p className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-[#231F20]'} transition-colors`}>{employee.extension || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div 
                className={`p-2 rounded-lg transition-colors`}
                style={{ backgroundColor: `${zodiac.color}15` }}
              >
                <Star className="w-5 h-5" style={{ color: zodiac.color }} />
              </div>
              <div className="flex-1">
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-[#6D6E71]'} uppercase tracking-wider font-bold transition-colors`}>Signo Zodiacal</p>
                <div className="flex items-center justify-between">
                  <p className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-[#231F20]'} flex items-center gap-2 transition-colors`}>
                    <span className="text-lg">{zodiac.symbol}</span>
                    {zodiac.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full transition-colors`} style={{ backgroundColor: `${zodiac.color}20`, color: zodiac.color }}>
                      {zodiac.element}
                    </span>
                    <span className="text-xl">{zodiac.icon}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-[#A7A9AC]/20'} transition-colors`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-[#F8FAFC]'} transition-colors`}>
                  <Heart className="w-5 h-5 text-[#F89B24]" />
                </div>
                <div>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-[#6D6E71]'} uppercase tracking-wider font-bold transition-colors`}>Contacto de Emergencia</p>
                  <p className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-[#231F20]'} transition-colors`}>{employee.contactoEmergencia} ({employee.pariente})</p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-[#6D6E71]'} transition-colors`}>{employee.numeroAlterno}</p>
                </div>
              </div>
            </div>

            {employee.customFields && employee.customFields.length > 0 && (
              <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-[#A7A9AC]/20'} transition-colors space-y-4`}>
                {employee.customFields.map((field, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-[#F8FAFC]'} transition-colors`}>
                      <Info className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-[#6D6E71]'}`} />
                    </div>
                    <div>
                      <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-[#6D6E71]'} uppercase tracking-wider font-bold transition-colors`}>{field.label}</p>
                      <p className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-[#231F20]'} transition-colors`}>{field.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const TalentForm = ({ 
  initialData, 
  onClose, 
  onSave, 
  onDelete,
  isDarkMode, 
  themeColor 
}: { 
  initialData: Employee | 'new', 
  onClose: () => void, 
  onSave: (emp: Employee) => void, 
  onDelete?: (id: string) => void,
  isDarkMode: boolean, 
  themeColor: string 
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>(
    initialData === 'new' 
      ? { nombre: '', area: '', correo: '', dia: 1, mes: 'Enero', mesNum: 1, customFields: [] } 
      : { ...initialData }
  );

  const [newField, setNewField] = useState({ label: '', value: '' });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.area) return;
    
    const mesNum = MONTHS_ES.indexOf(formData.mes || 'Enero') + 1;
    const finalData = {
      ...formData,
      id: formData.id || `emp-${Date.now()}`,
      mesNum
    } as Employee;
    
    onSave(finalData);
  };

  const addCustomField = () => {
    if (!newField.label || !newField.value) return;
    setFormData(prev => ({
      ...prev,
      customFields: [...(prev.customFields || []), { ...newField }]
    }));
    setNewField({ label: '', value: '' });
  };

  const removeCustomField = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields?.filter((_, i) => i !== idx)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1A1A]/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-100 text-[#1A1A1A]'} w-full max-w-2xl rounded-[40px] shadow-2xl border p-8 my-8`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black">{initialData === 'new' ? 'Nuevo Talento' : 'Editar Talento'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Nombre Completo</label>
              <input 
                required
                value={formData.nombre}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                className={`w-full p-4 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} focus:outline-none transition-all`}
                style={{ borderColor: formData.nombre ? `${themeColor}33` : undefined }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Área / Departamento</label>
              <input 
                required
                value={formData.area}
                onChange={e => setFormData({...formData, area: e.target.value})}
                className={`w-full p-4 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} focus:outline-none transition-all`}
                style={{ borderColor: formData.area ? `${themeColor}33` : undefined }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Correo Electrónico</label>
              <input 
                type="email"
                value={formData.correo}
                onChange={e => setFormData({...formData, correo: e.target.value})}
                className={`w-full p-4 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} focus:outline-none transition-all`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">URL de la Foto</label>
              <input 
                value={formData.foto || ''}
                onChange={e => setFormData({...formData, foto: e.target.value})}
                className={`w-full p-4 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} focus:outline-none transition-all`}
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Día</label>
                <input 
                  type="number" min="1" max="31"
                  value={formData.dia}
                  onChange={e => setFormData({...formData, dia: parseInt(e.target.value)})}
                  className={`w-full p-4 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} focus:outline-none transition-all`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Mes</label>
                <select 
                  value={formData.mes}
                  onChange={e => setFormData({...formData, mes: e.target.value})}
                  className={`w-full p-4 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'} focus:outline-none transition-all`}
                >
                  {MONTHS_ES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-black uppercase tracking-widest opacity-50">Campos Personalizados</h3>
            <div className="space-y-3">
              {formData.customFields?.map((field, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <div>
                    <span className="text-[10px] font-black uppercase mr-2 opacity-50">{field.label}:</span>
                    <span className="text-sm font-bold">{field.value}</span>
                  </div>
                  <button type="button" onClick={() => removeCustomField(idx)} className="text-red-500 hover:scale-110 transition-transform">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input 
                placeholder="Etiqueta (ej: Talla)"
                value={newField.label}
                onChange={e => setNewField({...newField, label: e.target.value})}
                className={`flex-1 p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} text-sm`}
              />
              <input 
                placeholder="Valor (ej: M)"
                value={newField.value}
                onChange={e => setNewField({...newField, value: e.target.value})}
                className={`flex-1 p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} text-sm`}
              />
              <button 
                type="button"
                onClick={addCustomField}
                className="p-3 rounded-xl text-white transition-all hover:scale-105"
                style={{ backgroundColor: themeColor }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            {initialData !== 'new' && onDelete && (
              <button 
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="px-8 py-4 rounded-2xl font-black text-red-500 border-2 border-red-500/20 hover:bg-red-500/10 transition-all"
              >
                Eliminar
              </button>
            )}
            <button 
              type="submit"
              className="flex-1 py-4 rounded-2xl font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: themeColor, boxShadow: `0 10px 30px -10px ${themeColor}66` }}
            >
              {initialData === 'new' ? 'Crear Talento' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('Todas');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditingTalent, setIsEditingTalent] = useState<Employee | null | 'new'>(null);
  const [currentMonth] = useState(new Date().getMonth());
  const [monthColors, setMonthColors] = useState<Record<string, string>>(DEFAULT_MONTH_COLORS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [celebrationItems, setCelebrationItems] = useState<{ id: number, x: number, y: number, color: string, emoji: string }[]>([]);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('themeColor') || '#7000FF';
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    return saved ? JSON.parse(saved) : false;
  });

  // --- Notification Logic ---
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
    
    if (notificationsEnabled && "Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!notificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") return;

    const checkBirthdays = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tDay = tomorrow.getDate();
      const tMonth = tomorrow.getMonth() + 1;

      const birthdayTalents = employees.filter(emp => emp.dia === tDay && emp.mesNum === tMonth);

      birthdayTalents.forEach(emp => {
        const lastNotifiedKey = `notified_${emp.id}_${new Date().getFullYear()}`;
        if (!localStorage.getItem(lastNotifiedKey)) {
          new Notification("¡Cumpleaños Mañana! 🎂", {
            body: `${emp.nombre} de ${emp.area} cumple años mañana. ¡No olvides felicitarle!`,
            icon: "https://i.postimg.cc/MvLnbhrR/WINDMAR-HOME-HAPPY-BIRTH.png"
          });
          localStorage.setItem(lastNotifiedKey, 'true');
        }
      });
    };

    // Check on mount and then every hour
    checkBirthdays();
    const interval = setInterval(checkBirthdays, 3600000);
    return () => clearInterval(interval);
  }, [notificationsEnabled, employees]);

  useEffect(() => {
    if (selectedEmployee) {
      const today = new Date();
      if (selectedEmployee.mesNum === today.getMonth() + 1 && selectedEmployee.dia === today.getDate()) {
        const colors = Object.values(monthColors);
        const emojis = ['🎈', '🎉', '🎊', '✨', '🎂', '🥳'];
        const newItems = Array.from({ length: 30 }).map((_, i) => ({
          id: Date.now() + i,
          x: window.innerWidth / 2 + (Math.random() * 400 - 200),
          y: window.innerHeight / 2 + (Math.random() * 400 - 200),
          color: colors[Math.floor(Math.random() * colors.length)],
          emoji: emojis[Math.floor(Math.random() * emojis.length)]
        }));
        setCelebrationItems(prev => [...prev, ...newItems]);
      }
    }
  }, [selectedEmployee, monthColors]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('themeColor', themeColor);
    // Update month colors to match theme color for a unified look
    const unifiedColors: Record<string, string> = {};
    MONTHS_ES.forEach(month => {
      unifiedColors[month] = themeColor;
    });
    setMonthColors(unifiedColors);
  }, [themeColor]);

  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees_v2');
    if (savedEmployees) {
      try {
        const parsed = JSON.parse(savedEmployees);
        // Patch fotos - garantiza que siempre se muestren aunque el cache sea antiguo
        const lauraPhoto = 'https://i.postimg.cc/x1PJj62t/Image-(1).jpg';
        const santiagoPhoto = '/talentos/santiago-felipe-riveros.jpg';
        const dianaPhoto = '/talentos/diana-carolina-velasquez.png';
        const patched = parsed.map((emp: Employee) => {
          if (emp.nombre.toLowerCase().includes('laura natalie gomez')) {
            return { ...emp, foto: lauraPhoto };
          }
          if (emp.nombre.toLowerCase().includes('santiago felipe riveros')) {
            return { ...emp, foto: santiagoPhoto };
          }
          if (emp.nombre.toLowerCase().includes('diana carolina velasquez')) {
            return { ...emp, foto: dianaPhoto };
          }
          return emp;
        });
        setEmployees(patched);
      } catch (e) {
        console.error('Error loading employees', e);
        setEmployees(parseEmployees(rawCsv));
      }
    } else {
      setEmployees(parseEmployees(rawCsv));
    }

    const savedColors = localStorage.getItem('monthColors');
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem('employees_v2', JSON.stringify(employees));
    }
  }, [employees]);

  const handleGlobalClick = (e: React.MouseEvent) => {
    const colors = Object.values(monthColors);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const emojis = ['🎈', '✨', '🎊'];
    const newItem = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
      color: randomColor,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    };
    setCelebrationItems(prev => [...prev, newItem]);
  };

  const removeCelebrationItem = (id: number) => {
    setCelebrationItems(prev => prev.filter(b => b.id !== id));
  };

  const handleSaveTalent = (emp: Employee) => {
    setEmployees(prev => {
      const exists = prev.find(e => e.id === emp.id);
      if (exists) {
        return prev.map(e => e.id === emp.id ? emp : e);
      }
      return [...prev, emp];
    });
    setIsEditingTalent(null);
    if (selectedEmployee?.id === emp.id) {
      setSelectedEmployee(emp);
    }
  };

  const handleDeleteTalent = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setIsEditingTalent(null);
    setSelectedEmployee(null);
  };

  const updateMonthColor = (month: string, color: string) => {
    const newColors = { ...monthColors, [month]: color };
    setMonthColors(newColors);
    localStorage.setItem('monthColors', JSON.stringify(newColors));
  };

  const resetColors = () => {
    setMonthColors(DEFAULT_MONTH_COLORS);
    localStorage.removeItem('monthColors');
  };

  const areas = useMemo(() => {
    const uniqueAreas = Array.from(new Set(employees.map(e => e.area)));
    return ['Todas', ...uniqueAreas];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesArea = selectedArea === 'Todas' || emp.area === selectedArea;
      return matchesSearch && matchesArea;
    });
  }, [employees, search, selectedArea]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, Employee[]> = {};
    MONTHS_ES.forEach(m => groups[m] = []);
    filteredEmployees.forEach(emp => {
      groups[emp.mes].push(emp);
    });
    Object.keys(groups).forEach(m => {
      groups[m].sort((a, b) => a.dia - b.dia);
    });
    return groups;
  }, [filteredEmployees]);

  const today = useMemo(() => new Date(), []);
  
  const todayBirthdays = useMemo(() => {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    return employees.filter(emp => {
      const isToday = emp.mesNum === today.getMonth() + 1 && emp.dia === today.getDate();
      const isTomorrow = emp.mesNum === tomorrow.getMonth() + 1 && emp.dia === tomorrow.getDate();
      return isToday || isTomorrow;
    });
  }, [employees, today]);

  const isCelebrating = (emp: Employee) => {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isToday = emp.mesNum === today.getMonth() + 1 && emp.dia === today.getDate();
    const isTomorrow = emp.mesNum === tomorrow.getMonth() + 1 && emp.dia === tomorrow.getDate();
    return isToday || isTomorrow;
  };

  const upcomingBirthdays = useMemo(() => {
    const currentDay = today.getDate();
    const currentMonthNum = today.getMonth() + 1;
    
    return employees
      .filter(emp => {
        if (emp.mesNum > currentMonthNum) return true;
        if (emp.mesNum === currentMonthNum && emp.dia > currentDay) return true;
        return false;
      })
      .sort((a, b) => {
        if (a.mesNum !== b.mesNum) return a.mesNum - b.mesNum;
        return a.dia - b.dia;
      })
      .slice(0, 5);
  }, [employees]);

  return (
    <>
    <AnimatePresence mode="wait">
      {!isAppReady ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
            filter: "blur(10px)",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
          }}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Animated Background Elements (Balloons) */}
          <div className="absolute inset-0 overflow-hidden z-10 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: "110%",
                  scale: Math.random() * 0.4 + 0.4,
                  opacity: 0.15
                }}
                animate={{ 
                  y: "-10%",
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
                className="absolute text-3xl"
              >
                🎈
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 flex flex-col items-center"
          >
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="w-64 h-64 bg-white rounded-[72px] flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.15)] mb-12 overflow-hidden p-8 border border-white/10"
            >
              <img 
                src="https://i.postimg.cc/MvLnbhrR/WINDMAR-HOME-HAPPY-BIRTH.png" 
                alt="Windmar Home Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-6xl font-black text-white tracking-tighter mb-4 text-center"
            >
              Windmar <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3366] to-[#7000FF]">Celebration</span>
            </motion.h1>
            
            <div className="flex flex-col items-center gap-8">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 240 }}
                transition={{ delay: 1, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="h-[1px] bg-white/10 rounded-full overflow-hidden relative"
              >
                <motion.div 
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2"
                />
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1.5 }}
                className="text-white text-[12px] font-black uppercase tracking-[0.6em]"
              >
                Preparando Sorpresas
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          key="app"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`flex h-screen ${isDarkMode ? 'bg-[#0F172A] text-white' : 'bg-[#F0F2F5] text-[#1A1A1A]'} font-sans overflow-hidden transition-colors duration-500 relative`}
          style={{ 
            // @ts-ignore
            '--theme-color': themeColor,
            '--theme-color-20': `${themeColor}33`,
            '--theme-color-10': `${themeColor}1a`
          } as React.CSSProperties}
          onClick={handleGlobalClick}
        >
          {celebrationItems.map(item => (
            <CelebrationItem 
              key={item.id} 
              x={item.x} 
              y={item.y} 
              color={item.color} 
              emoji={item.emoji}
              onComplete={() => removeCelebrationItem(item.id)} 
            />
          ))}

          {/* Main Content */}
          <main className={`flex-1 flex flex-col overflow-y-auto overflow-x-hidden ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'} transition-colors duration-500`}>
            {/* Unified Header */}
            <header className={`sticky top-0 z-40 w-full ${isDarkMode ? 'bg-[#1E293B]/80' : 'bg-white/80'} backdrop-blur-xl border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200/60'} p-4 md:p-6 transition-colors duration-500`}>
              <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
                {/* Top Row: Logo, Search, Actions */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-12">
                  <div className="flex items-center gap-4 group cursor-pointer shrink-0">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/10 transform group-hover:rotate-6 transition-transform overflow-hidden p-1.5 border border-slate-100">
                      <img 
                        src="https://i.postimg.cc/MvLnbhrR/WINDMAR-HOME-HAPPY-BIRTH.png" 
                        alt="Windmar Home Logo" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="hidden sm:block">
                      <h2 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'} leading-tight tracking-tight transition-colors`}>Celebration</h2>
                      <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-[#6D6E71]'} font-bold uppercase tracking-widest opacity-60 transition-colors`}>Windmar Hub</p>
                    </div>
                  </div>

                  <div className="relative flex-1 w-full lg:max-w-3xl">
                    <Search 
                      className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-[#A7A9AC]'} transition-colors`} 
                      style={{ color: search ? themeColor : undefined }}
                    />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, área o cargo..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-slate-800 text-white placeholder:text-slate-500 focus:bg-slate-900' : 'bg-[#F8FAFC] text-[#1A1A1A] placeholder:text-[#A7A9AC] focus:bg-white'} border-2 border-transparent rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none transition-all font-medium shadow-sm`}
                      style={{ borderColor: search ? `${themeColor}33` : 'transparent' }}
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button 
                      onClick={() => setIsEditingTalent('new')}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-105 text-slate-500 hover:text-[#7000FF]"
                      style={{ color: themeColor }}
                      title="Agregar Talento"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <div className="relative group/color">
                      <button 
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-105"
                        title="Color de Tema"
                      >
                        <div 
                          className="w-5 h-5 rounded-full shadow-inner"
                          style={{ backgroundColor: themeColor }}
                        />
                      </button>
                      <div className="absolute top-full right-0 mt-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[300] hidden group-hover/color:block w-48 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Acento Primario</p>
                        <div className="grid grid-cols-4 gap-2">
                          {['#7000FF', '#FF3366', '#00BBF9', '#00F5D4', '#FEE440', '#FF9E00', '#9EF01A', '#F15BB5'].map(color => (
                            <button
                              key={color}
                              onClick={() => setThemeColor(color)}
                              className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${themeColor === color ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-800' : ''}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                          <input 
                            type="color" 
                            value={themeColor}
                            onChange={(e) => setThemeColor(e.target.value)}
                            className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      title={notificationsEnabled ? "Desactivar recordatorios" : "Activar recordatorios"}
                      className={`p-2.5 rounded-xl transition-all ${
                        notificationsEnabled 
                          ? '' 
                          : isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                      }`}
                      style={notificationsEnabled ? { backgroundColor: `${themeColor}1a`, color: themeColor } : {}}
                    >
                      {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-all`}
                    >
                      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }}
                      className={`p-2.5 ${isDarkMode ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' : 'bg-white text-[#1A1A1A] border-slate-100 hover:bg-slate-50'} rounded-xl transition-all border group`}
                      style={{ borderColor: isSettingsOpen ? themeColor : undefined }}
                    >
                      <Settings className="w-5 h-5 transition-transform duration-500" style={{ color: isSettingsOpen ? themeColor : undefined }} />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Title, Stats, Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className={`text-2xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'} transition-colors`}>Calendario Anual</h1>
                    <div className="flex items-center gap-2">
                      <span className={`${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-[#1A1A1A] border-slate-100'} px-3 py-1 rounded-full text-[10px] font-black shadow-sm border transition-colors`}>
                        {employees.length} TALENTOS
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black transition-colors`} style={{ backgroundColor: `${themeColor}33`, color: themeColor }}>
                        {employees.filter(e => e.mesNum === today.getMonth() + 1).length} ESTE MES
                      </span>
                      {upcomingBirthdays.length > 0 && (
                        <div className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-white'} shadow-sm transition-all animate-in fade-in slide-in-from-left-2`}>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Próximo:</p>
                          <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{formatDisplayName(upcomingBirthdays[0].nombre)}</p>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <p className="text-[10px] font-black" style={{ color: themeColor }}>{upcomingBirthdays[0].dia} {upcomingBirthdays[0].mes.slice(0, 3)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                      <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDarkMode ? 'text-slate-500' : 'text-[#A7A9AC]'} transition-colors`} style={{ color: selectedArea !== 'Todas' ? themeColor : undefined }} />
                      <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className={`${isDarkMode ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' : 'bg-white text-[#1A1A1A] border-slate-100 hover:bg-slate-50'} border-2 rounded-xl py-2 pl-9 pr-8 text-[11px] focus:outline-none appearance-none transition-all cursor-pointer font-black min-w-[140px] w-full`}
                        style={{ borderColor: selectedArea !== 'Todas' ? `${themeColor}33` : 'transparent' }}
                      >
                        {areas.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronRight className={`w-3 h-3 ${isDarkMode ? 'text-slate-500' : 'text-[#A7A9AC]'} rotate-90`} />
                      </div>
                    </div>
                    <div className="flex gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-[#7000FF]' : 'text-slate-400 hover:text-slate-600'}`}
                        style={viewMode === 'grid' ? { color: themeColor } : {}}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-[#7000FF]' : 'text-slate-400 hover:text-slate-600'}`}
                        style={viewMode === 'list' ? { color: themeColor } : {}}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            <div className="p-4 md:p-12 flex flex-col gap-10 max-w-[1600px] mx-auto w-full">
              {/* Highlights Section (Today & Upcoming) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Today's Card */}
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="lg:col-span-2 text-white p-6 lg:p-10 rounded-[40px] shadow-2xl relative overflow-hidden group cursor-default h-full flex flex-col justify-center min-h-[420px]"
                  style={{ 
                    background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd, ${themeColor}aa)`,
                    boxShadow: `0 20px 40px -12px ${themeColor}4d`
                  }}
                >
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl transition-transform group-hover:scale-150 duration-700" />
                  <div className="relative z-10 w-full flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6 lg:mb-2 text-left">
                      <div>
                        <h3 className="text-[10px] uppercase tracking-[0.5em] font-black opacity-80 mb-1">HOY</h3>
                        <div className="flex items-baseline gap-2">
                          <p className="text-5xl lg:text-6xl font-black leading-none">{today.getDate()}</p>
                          <p className="text-xl font-bold opacity-90">{MONTHS_ES[today.getMonth()]}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md hidden sm:block">
                        <Cake className="w-8 h-8 text-white/40" />
                      </div>
                    </div>
                    
                    <div className="w-full flex-1 flex items-center">
                      {todayBirthdays.length > 0 ? (
                        todayBirthdays.map(emp => {
                          const isActuallyToday = emp.dia === today.getDate();
                          return (
                            <div 
                              key={emp.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); }}
                              className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 cursor-pointer group/item transition-all relative w-full"
                            >
                              {!isActuallyToday && (
                                <div className="absolute -top-4 right-0 lg:top-[-4.5rem] bg-yellow-400 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl z-20 border-2 border-white/20 scale-110">
                                  Mañana
                                </div>
                              )}
                              <div className={`w-64 h-64 lg:w-80 lg:h-80 ${emp.foto ? '' : 'bg-white/20 backdrop-blur-md shadow-2xl'} rounded-full flex items-center justify-center font-black text-8xl lg:text-9xl border-8 border-white/40 overflow-hidden transition-all group-hover/item:scale-105 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] ring-4 ring-white/10 shrink-0`}>
                                {emp.foto ? (
                                  <img src={emp.foto} alt={emp.nombre} className="w-full h-full object-contain" style={{ transform: 'scale(1.34)', transformOrigin: 'center center' }} referrerPolicy="no-referrer" />
                                ) : (
                                  emp.nombre.charAt(0)
                                )}
                              </div>
                              <div className="text-center lg:text-left space-y-4 max-w-md">
                                <p className="font-black text-4xl lg:text-6xl leading-tight text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] tracking-tighter">{formatDisplayName(emp.nombre)}</p>
                                <div className="flex flex-col gap-2">
                                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 rounded-xl backdrop-blur-md w-fit mx-auto lg:mx-0">
                                    <MapPin className="w-4 h-4 text-white/60" />
                                    <p className="text-xs lg:text-sm opacity-100 font-black uppercase tracking-[0.2em] text-white overflow-hidden text-ellipsis whitespace-nowrap">{emp.area}</p>
                                  </div>
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 ml-1 hidden lg:block">TALENTO WINDMAR HOME</p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-12 text-center bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-sm">
                          <p className="text-sm opacity-60 italic font-bold mb-2">¡Día tranquilo!</p>
                          <p className="text-xs opacity-40">No hay cumpleaños programados para hoy ni mañana.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Upcoming Birthdays Dashboard */}
                <div className={`lg:col-span-2 p-8 rounded-[40px] border ${isDarkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100'} shadow-xl transition-colors duration-500`}>
                  <div className="flex justify-between items-center mb-8">
                    <h4 className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-[#A7A9AC]'} uppercase tracking-[0.3em] font-black transition-colors`}>PRÓXIMOS CUMPLEAÑOS</h4>
                    <Sparkles className="w-5 h-5 text-yellow-400 opacity-50" />
                  </div>
                  <div className="flex flex-col gap-4">
                    {upcomingBirthdays.map((emp, idx) => (
                      <motion.div 
                        key={emp.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ x: 10, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                        onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); }}
                        className="flex justify-between items-center p-6 rounded-[24px] cursor-pointer group transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-6 min-w-0">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-xl transition-transform group-hover:scale-110 overflow-hidden border-2 border-white/20`} style={{ backgroundColor: monthColors[emp.mes] }}>
                            {emp.foto ? (
                              <img src={emp.foto} alt={emp.nombre} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                            ) : (
                              emp.nombre.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xl ${isDarkMode ? 'text-slate-100' : 'text-[#1A1A1A]'} font-black transition-colors truncate`}>
                              {formatDisplayName(emp.nombre)}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full opacity-40 shrink-0" style={{ backgroundColor: themeColor }} />
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider truncate">{emp.area}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-xl font-black" style={{ color: themeColor }}>{emp.dia} {emp.mes.slice(0, 3)}</p>
                          <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} font-black uppercase tracking-tighter`}>
                            {Math.ceil((new Date(today.getFullYear(), emp.mesNum - 1, emp.dia).getTime() - today.getTime()) / (1000 * 3600 * 24)) === 1 
                              ? '¡Mañana!' 
                              : `Faltan ${Math.ceil((new Date(today.getFullYear(), emp.mesNum - 1, emp.dia).getTime() - today.getTime()) / (1000 * 3600 * 24))} días`}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

        {/* Main View Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 flex-1">
            {MONTHS_ES.map((month, idx) => {
              const birthdays = groupedByMonth[month];
              const isCurrentMonth = idx === currentMonth;
              const accentColor = monthColors[month];
              
              return (
                <motion.div
                  key={month}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    boxShadow: isCurrentMonth 
                      ? (isDarkMode ? `0 0 40px ${themeColor}33` : `0 0 40px ${themeColor}1a`)
                      : undefined
                  }}
                  transition={{ 
                    duration: 0.6,
                    delay: idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                    boxShadow: isCurrentMonth ? {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    } : undefined
                  }}
                  className={`${isDarkMode ? 'bg-[#1E293B] border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : 'bg-white border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} border-[3px] rounded-[40px] p-8 flex flex-col hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all relative group overflow-hidden`}
                  style={{ borderColor: isCurrentMonth ? themeColor : 'transparent' }}
                >
                  {isCurrentMonth && (
                    <div className="absolute top-0 right-0 text-white px-4 py-1.5 rounded-bl-2xl text-[9px] font-black tracking-widest uppercase" style={{ backgroundColor: themeColor }}>
                      Actual
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full shadow-lg" 
                        style={{ backgroundColor: accentColor, boxShadow: `0 4px 12px ${accentColor}40` }} 
                      />
                      <h3 className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'} tracking-tight transition-colors`}>{month}</h3>
                    </div>
                    <div className={`${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-[#F8FAFC] text-[#1A1A1A] border-slate-100'} w-9 h-9 flex items-center justify-center rounded-2xl text-xs font-black border transition-colors`}>
                      {birthdays.length}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar">
                    {birthdays.length > 0 ? (
                      <div className="space-y-5">
                        {birthdays.map(emp => {
                          const celebrating = isCelebrating(emp);
                          return (
                            <motion.div
                              key={emp.id}
                              layoutId={emp.id}
                              whileHover={{ x: 6 }}
                              onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); }}
                              className={`flex items-center justify-between group/item cursor-pointer relative p-1 -m-1 rounded-xl transition-all ${celebrating ? 'bg-gradient-to-r from-yellow-400/10 to-transparent' : ''}`}
                            >
                              {celebrating && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                  {[...Array(4)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      animate={{ 
                                        opacity: [0, 1, 0],
                                        scale: [0, 1.2, 0],
                                        y: [10, -10],
                                        x: [-5, 5]
                                      }}
                                      transition={{
                                        duration: 2 + Math.random() * 2,
                                        repeat: Infinity,
                                        delay: Math.random() * 2,
                                      }}
                                      className="absolute"
                                      style={{ left: Math.random() * 100 + "%", top: Math.random() * 100 + "%" }}
                                    >
                                      <Sparkles className="w-2 h-2 text-yellow-400/60" />
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center gap-4 min-w-0 relative z-10">
                                <span 
                                  className="text-sm font-black w-7 text-right opacity-40 group-hover/item:opacity-100 transition-opacity"
                                  style={{ color: celebrating ? '#FFD700' : accentColor }}
                                >
                                  {emp.dia}
                                </span>
                                <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-[#1A1A1A]'} truncate transition-colors group-hover/item:opacity-100 uppercase tracking-tight`}>
                                  {emp.nombre.split(' ')[0]} {emp.nombre.split(' ')[1] || ''}
                                  {celebrating && <span className="ml-2 text-xs">🎂</span>}
                                </span>
                              </div>
                              <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-slate-600' : 'text-[#A7A9AC]/30'} transition-colors relative z-10`} />
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center py-16 opacity-20">
                        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-500' : 'text-[#A7A9AC]'} transition-colors`}>Relax</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 bg-white dark:bg-[#1E293B] rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black">Lista Maestra de Cumpleaños</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black">{filteredEmployees.length} Resultados</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="min-w-[800px] p-8">
                {/* Table Header */}
                <div className={`grid grid-cols-12 gap-4 px-6 py-4 mb-4 rounded-2xl ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-[#A7A9AC]'} text-[10px] font-black uppercase tracking-[0.2em]`}>
                  <div className="col-span-1 text-center shrink-0">#</div>
                  <div className="col-span-5">Talento / Cargo</div>
                  <div className="col-span-3">Área / Departamento</div>
                  <div className="col-span-3 text-right pr-12">Cumpleaños</div>
                </div>

                <div className="flex flex-col gap-1">
                  {filteredEmployees
                    .sort((a, b) => {
                      if (a.mesNum !== b.mesNum) return a.mesNum - b.mesNum;
                      return a.dia - b.dia;
                    })
                    .map((emp, idx) => {
                      const celebrating = isCelebrating(emp);
                      const isEven = idx % 2 === 0;
                      return (
                        <motion.div
                          key={emp.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          onClick={() => setSelectedEmployee(emp)}
                          className={`grid grid-cols-12 items-center gap-4 px-6 py-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                            isDarkMode 
                              ? `${isEven ? 'bg-transparent' : 'bg-slate-800/20'} border-transparent hover:bg-slate-800/50 hover:border-slate-700` 
                              : `${isEven ? 'bg-transparent' : 'bg-slate-50/50'} border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl`
                          } ${celebrating ? 'ring-2 ring-yellow-400/50 bg-yellow-400/5 dark:bg-yellow-400/5' : ''}`}
                        >
                          {celebrating && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                              {[...Array(6)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  animate={{ 
                                    opacity: [0, 0.6, 0],
                                    scale: [0.5, 1, 0.5],
                                    rotate: [0, 180, 360],
                                  }}
                                  transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 5,
                                  }}
                                  className="absolute"
                                  style={{ left: Math.random() * 100 + "%", top: Math.random() * 100 + "%" }}
                                >
                                  <Sparkles className="w-3 h-3 text-yellow-400" />
                                </motion.div>
                              ))}
                            </div>
                          )}
                          
                          {/* Index Column */}
                          <div className={`col-span-1 text-[10px] font-black opacity-30 text-center shrink-0`}>
                            {(idx + 1).toString().padStart(2, '0')}
                          </div>

                          {/* Talent Column */}
                          <div className="col-span-5 flex items-center gap-4 relative z-10 min-w-0">
                            <div 
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-lg shrink-0 overflow-hidden border-2 ${celebrating ? 'border-yellow-400' : 'border-white/20'}`}
                              style={{ backgroundColor: celebrating ? '#FFD700' : themeColor }}
                            >
                              {emp.foto ? (
                                <img src={emp.foto} alt={emp.nombre} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                              ) : (
                                emp.nombre.charAt(0)
                              )}
                            </div>
                            <div className="truncate">
                              <p className={`font-black text-sm leading-tight transition-colors flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>
                                {emp.nombre}
                                {celebrating && <span className="text-[10px] px-2 py-0.5 bg-yellow-400 text-black rounded-full font-black uppercase tracking-tighter">Cumple</span>}
                              </p>
                              <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest truncate">Talento Windmar</p>
                            </div>
                          </div>

                          {/* Area Column */}
                          <div className="col-span-3 relative z-10 truncate">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'} transition-colors`}>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} />
                              <p className={`text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-[#1A1A1A]'}`}>{emp.area}</p>
                            </div>
                          </div>

                          {/* Birthday Column */}
                          <div className="col-span-3 flex items-center justify-end gap-6 relative z-10 pr-4">
                            <div className="text-right">
                              <p className="text-sm font-black" style={{ color: celebrating ? '#FFD700' : themeColor }}>{emp.dia} de {emp.mes}</p>
                              <p className="text-[9px] font-black opacity-30 uppercase tracking-tighter">Nacimiento</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend Footer */}
        <footer className={`flex items-center gap-10 text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-[#A7A9AC]'} font-black uppercase tracking-[0.2em] pt-8 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} transition-colors`}>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-[#7000FF]" />
            <span>Mes Actual</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#FF3366] to-[#7000FF] shadow-lg shadow-purple-500/20" />
            <span>Celebración</span>
          </div>
          <div className={`ml-auto ${isDarkMode ? 'text-slate-400' : 'text-[#1A1A1A]'} opacity-40 transition-colors`}>
            © 2025 Celebration Hub
          </div>
        </footer>
      </div>
    </main>

      <AnimatePresence>
        {selectedEmployee && (
          <Modal 
            employee={selectedEmployee} 
            onClose={() => setSelectedEmployee(null)} 
            onEdit={(emp) => setIsEditingTalent(emp)}
            monthColors={monthColors}
            isDarkMode={isDarkMode}
          />
        )}
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-md"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className={`${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-100'} w-full max-w-2xl rounded-[48px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.2)] border p-10 transition-colors duration-500`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-[#1A1A1A]'} tracking-tight transition-colors`}>Personalizar</h2>
                  <p className={`${isDarkMode ? 'text-slate-400' : 'text-[#6D6E71]'} text-sm font-bold opacity-60 transition-colors`}>Crea tu propia atmósfera festiva</p>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className={`p-3 rounded-2xl ${isDarkMode ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-100 text-[#1A1A1A]'} transition-colors`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-10">
                {MONTHS_ES.map(month => (
                  <div key={month} className={`flex items-center gap-4 p-4 ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-[#7000FF]/40' : 'bg-[#F8FAFC] border-slate-100 hover:border-[#7000FF]/20'} rounded-[24px] border transition-all group`}>
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                      <input 
                        type="color" 
                        value={monthColors[month]}
                        onChange={(e) => updateMonthColor(month, e.target.value)}
                        className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none bg-transparent"
                      />
                    </div>
                    <span className={`text-xs font-black ${isDarkMode ? 'text-slate-200' : 'text-[#1A1A1A]'} uppercase tracking-wider transition-colors`}>{month}</span>
                  </div>
                ))}
              </div>

              <div className={`flex justify-between items-center pt-8 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} transition-colors`}>
                <button 
                  onClick={resetColors}
                  className={`text-[10px] font-black ${isDarkMode ? 'text-slate-500 hover:text-[#FF3366]' : 'text-[#A7A9AC] hover:text-[#FF3366]'} transition-colors uppercase tracking-[0.2em]`}
                >
                  Restablecer todo
                </button>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className={`${isDarkMode ? 'bg-white text-[#1A1A1A] hover:bg-slate-200' : 'bg-[#1A1A1A] text-white hover:bg-[#7000FF]'} px-10 py-4 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 hover:shadow-purple-500/20`}
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {isEditingTalent && (
          <TalentForm 
            initialData={isEditingTalent}
            onClose={() => setIsEditingTalent(null)}
            onSave={handleSaveTalent}
            onDelete={handleDeleteTalent}
            isDarkMode={isDarkMode}
            themeColor={themeColor}
          />
        )}
      </AnimatePresence>
    </motion.div>
    )}
    </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#334155' : '#E2E8F0'};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7000FF;
        }
      `}</style>
    </>
  );
}
