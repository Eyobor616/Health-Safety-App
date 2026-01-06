
import React, { useState } from 'react';
import { Camera, X, Check, ArrowLeft, ChevronDown, Loader2 } from 'lucide-react';
import { SBO, SBOType, ActOrCondition, User } from '../types';
import { LOCATIONS, UNITS, AREA_MANAGERS, CATEGORIES, getSubCategories } from '../constants';
import { uploadSBOImage, createSBO } from '../api';

interface NewSBOFormProps {
  onSubmit: (entry: SBO) => void;
  onCancel: () => void;
  currentUser: User;
}

const NewSBOForm: React.FC<NewSBOFormProps> = ({ onSubmit, onCancel, currentUser }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    actOrCondition: 'act' as ActOrCondition,
    location: '',
    unit: '',
    areaMgr: '',
    category: '',
    subCategory: '',
    type: 'safe' as SBOType,
    description: '',
    suggestedSolution: '',
    image: null as string | null
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'category') updated.subCategory = '';
      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleInputChange('image', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = [];
    if (!formData.location) newErrors.push('Location must be selected.');
    if (!formData.unit) newErrors.push('Unit must be selected.');
    if (!formData.areaMgr) newErrors.push('Area Manager must be selected.');
    if (!formData.category) newErrors.push('Category must be selected.');
    if (!formData.subCategory) newErrors.push('Sub Category must be selected.');
    if (!formData.description.trim()) newErrors.push('Observation description is required.');
    if (formData.type !== 'safe' && !formData.suggestedSolution.trim()) {
      newErrors.push('Suggested Solution is mandatory for unsafe acts or near misses.');
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = undefined;
      if (formData.image) {
        imageUrl = await uploadSBOImage(formData.image, currentUser.id);
      }

      const sboData: Omit<SBO, 'id'> = {
        timestamp: Date.now(),
        observer: currentUser,
        type: formData.type,
        actOrCondition: formData.actOrCondition,
        location: formData.location,
        unit: formData.unit,
        areaMgr: formData.areaMgr,
        category: formData.category,
        subCategory: formData.subCategory,
        description: formData.description,
        suggestedSolution: formData.suggestedSolution,
        ...(imageUrl && { imageUrl }),
        status: formData.type === 'safe' ? 'closed' : 'open',
        comments: [],
        notifications: []
      };

      const docId = await createSBO(sboData);
      onSubmit({ ...sboData, id: docId } as SBO);
    } catch (err) {
      console.error(err);
      setErrors(['Network error: Failed to sync submission. Please check your connection.']);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-10 -mx-6 px-6">
        <button type="button" onClick={onCancel} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">New SBO Report</h2>
      </div>

      {errors.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl shadow-sm">
          <p className="text-rose-700 text-xs font-black uppercase tracking-wider mb-2">Attention Required</p>
          <ul className="list-none text-rose-600 text-xs space-y-1 font-medium">
            {errors.map((err, i) => <li key={i} className="flex items-center gap-1.5"><X size={12}/> {err}</li>)}
          </ul>
        </div>
      )}

      {/* Act vs Condition Toggle */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Observation Focus</h3>
          <p className="text-sm font-bold text-slate-700 capitalize mt-1">
            Focusing on: <span className={formData.actOrCondition === 'act' ? 'text-blue-600' : 'text-emerald-600'}>{formData.actOrCondition}</span>
          </p>
        </div>
        <div 
          onClick={() => !submitting && handleInputChange('actOrCondition', formData.actOrCondition === 'act' ? 'condition' : 'act')}
          className="relative w-16 h-8 bg-slate-100 rounded-full cursor-pointer transition-colors duration-300 border border-slate-200"
        >
          <div className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${formData.actOrCondition === 'condition' ? 'translate-x-8 bg-emerald-500' : 'translate-x-0 bg-blue-600'}`}>
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Primary Details */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2">Where did this occur?</h3>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Plant Location</label>
            <div className="relative">
              <select 
                className="w-full appearance-none p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={submitting}
              >
                <option value="">Select Plant</option>
                {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Unit / Line</label>
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-bold focus:ring-4 focus:ring-blue-100"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                disabled={submitting}
              >
                <option value="">Unit</option>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Area Manager</label>
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-bold focus:ring-4 focus:ring-blue-100"
                value={formData.areaMgr}
                onChange={(e) => handleInputChange('areaMgr', e.target.value)}
                disabled={submitting}
              >
                <option value="">Manager</option>
                {AREA_MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Category Selection Radios */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2">Primary Category</h3>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              disabled={submitting}
              onClick={() => handleInputChange('category', cat)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                formData.category === cat 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'bg-white border-slate-100 text-slate-600'
              }`}
            >
              <span className={`text-[10px] font-black uppercase block mb-1 opacity-60`}>Category</span>
              <span className="text-[11px] font-black block leading-tight">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Sub-Category Selection Radios */}
      {formData.category && (
        <section className="space-y-4 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2">Specific Concern</h3>
          <div className="bg-white p-4 rounded-[2rem] border border-slate-100 flex flex-wrap gap-2">
            {getSubCategories(formData.category).map(sub => (
              <button
                key={sub}
                type="button"
                disabled={submitting}
                onClick={() => handleInputChange('subCategory', sub)}
                className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                  formData.subCategory === sub 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Scale (Safe/Unsafe/Near Miss) */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2">Observation Level</h3>
        <div className="bg-white p-4 rounded-[2rem] border border-slate-100">
          <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] gap-1">
            {(['safe', 'unsafe', 'near-miss'] as SBOType[]).map((level) => (
              <button
                key={level}
                type="button"
                disabled={submitting}
                onClick={() => handleInputChange('type', level)}
                className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${
                  formData.type === level 
                    ? level === 'safe' ? 'bg-emerald-500 text-white shadow-lg' : 
                      level === 'unsafe' ? 'bg-rose-500 text-white shadow-lg' : 
                      'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-400'
                }`}
              >
                {level.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Textarea Fields */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2">Details & Corrective Action</h3>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Observation Description</label>
            <textarea
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium h-32 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
              placeholder="What specifically happened?"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Suggested Solution</label>
            <textarea
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium h-24 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
              placeholder="Recommended improvement..."
              value={formData.suggestedSolution}
              onChange={(e) => handleInputChange('suggestedSolution', e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="pt-2">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 block mb-3">Supporting Image</label>
            <div className="flex gap-4">
              {formData.image ? (
                <div className="relative w-28 h-28 rounded-[2rem] overflow-hidden ring-4 ring-blue-50 border border-slate-200 shadow-md">
                  <img src={formData.image} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleInputChange('image', null)}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-xl backdrop-blur-md"
                    disabled={submitting}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="w-full h-28 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all bg-slate-50/50 group">
                  <Camera size={28} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">Attach Evidence</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={submitting} />
                </label>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 py-5 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-2 border-slate-100 rounded-[2rem] hover:bg-slate-50 active:scale-95 transition-all"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-[2] py-5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-[2rem] shadow-xl shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {submitting ? 'Submitting...' : 'Send Report'}
        </button>
      </div>
    </form>
  );
};

export default NewSBOForm;
