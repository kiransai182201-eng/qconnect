import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Settings,
  ChevronDown,
  ChevronRight,
  List,
  CheckSquare,
  ToggleRight,
  Hash,
  Type,
  Save,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import '../menu-builder.css';

const ICONS = {
  radio: <ToggleRight size={16} />,
  checkbox: <CheckSquare size={16} />,
  dropdown: <List size={16} />,
  quantity: <Hash size={16} />,
  text: <Type size={16} />,
};

const TemplateLibrary = () => {
  const { shop } = useOutletContext();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  
  const [groups, setGroups] = useState([]);
  const [options, setOptions] = useState([]);
  
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Inline Adding State
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', selection_type: 'radio', is_required: false, min_selections: 0, max_selections: 1 });
  
  const [addingOptionToGroup, setAddingOptionToGroup] = useState(null);
  const [newOption, setNewOption] = useState({ name: '', price_type: 'fixed', price_value: 0, is_default: false });

  useEffect(() => {
    if (shop?.id) {
      fetchTemplates();
    }
  }, [shop]);

  useEffect(() => {
    if (activeTemplateId) {
      fetchTemplateDetails(activeTemplateId);
      setIsAddingGroup(false);
      setAddingOptionToGroup(null);
    }
  }, [activeTemplateId]);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customization_templates')
      .select('*')
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: true });
      
    if (data) {
      setTemplates(data);
      if (data.length > 0 && !activeTemplateId) {
        setActiveTemplateId(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchTemplateDetails = async (templateId) => {
    const { data: gData } = await supabase
      .from('template_groups')
      .select('*')
      .eq('template_id', templateId)
      .order('display_order', { ascending: true });
      
    if (gData) setGroups(gData);
    
    if (gData && gData.length > 0) {
      const groupIds = gData.map(g => g.id);
      const { data: oData } = await supabase
        .from('template_options')
        .select('*')
        .in('group_id', groupIds)
        .order('display_order', { ascending: true });
        
      if (oData) setOptions(oData);
    } else {
      setOptions([]);
    }
  };

  const createTemplate = async () => {
    if (!newTemplateName.trim() || !shop?.id) return;
    
    const { data, error } = await supabase
      .from('customization_templates')
      .insert([{ shop_id: shop.id, name: newTemplateName.trim() }])
      .select();
      
    if (data && data[0]) {
      setTemplates([...templates, data[0]]);
      setActiveTemplateId(data[0].id);
      setNewTemplateName('');
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    await supabase.from('customization_templates').delete().eq('id', id);
    const remaining = templates.filter(t => t.id !== id);
    setTemplates(remaining);
    if (activeTemplateId === id) {
      setActiveTemplateId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const toggleGroup = (id) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group Management
  const handleSaveGroup = async () => {
    if (!newGroup.name.trim()) return;
    const { data, error } = await supabase
      .from('template_groups')
      .insert([{
        template_id: activeTemplateId,
        name: newGroup.name.trim(),
        selection_type: newGroup.selection_type,
        is_required: newGroup.is_required,
        min_selections: newGroup.min_selections,
        max_selections: newGroup.max_selections,
        display_order: groups.length
      }])
      .select();
      
    if (data && data[0]) {
      setGroups([...groups, data[0]]);
      setIsAddingGroup(false);
      setNewGroup({ name: '', selection_type: 'radio', is_required: false, min_selections: 0, max_selections: 1 });
      // Auto expand new group
      setExpandedGroups(prev => new Set(prev).add(data[0].id));
    } else if (error) {
      alert("Error adding group: " + error.message);
    }
  };

  const deleteGroup = async (id) => {
    if (!confirm('Delete this group and all its options?')) return;
    await supabase.from('template_groups').delete().eq('id', id);
    setGroups(groups.filter(g => g.id !== id));
    setOptions(options.filter(o => o.group_id !== id));
  };

  // Option Management
  const handleSaveOption = async (groupId) => {
    if (!newOption.name.trim()) return;
    const currentOptions = options.filter(o => o.group_id === groupId);
    const { data, error } = await supabase
      .from('template_options')
      .insert([{
        group_id: groupId,
        name: newOption.name.trim(),
        price_type: newOption.price_type,
        price_value: parseFloat(newOption.price_value) || 0,
        is_default: newOption.is_default,
        display_order: currentOptions.length
      }])
      .select();

    if (data && data[0]) {
      setOptions([...options, data[0]]);
      setAddingOptionToGroup(null);
      setNewOption({ name: '', price_type: 'fixed', price_value: 0, is_default: false });
    } else if (error) {
      alert("Error adding option: " + error.message);
    }
  };

  const deleteOption = async (id) => {
    await supabase.from('template_options').delete().eq('id', id);
    setOptions(options.filter(o => o.id !== id));
  };

  const activeTemplate = templates.find(t => t.id === activeTemplateId);

  return (
    <div className="mb-page-wrapper">
      <div className="mb-grid-layout">
        
        {/* SIDEBAR: Templates List */}
        <div className="mb-categories-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Template Library</h3>
          </div>
          
          <div className="mb-category-list">
            {templates.map(t => (
              <div 
                key={t.id} 
                className={`mb-category-item ${activeTemplateId === t.id ? 'active' : ''}`}
                onClick={() => setActiveTemplateId(t.id)}
              >
                <div className="mb-category-left">
                  <Settings size={16} style={{ color: activeTemplateId === t.id ? 'var(--color-accent)' : 'var(--color-text-muted)', marginRight: '8px' }} />
                  <span className="mb-category-name">{t.name}</span>
                </div>
                <div className="mb-category-actions">
                  <button className="mb-cat-btn delete" onClick={(e) => { e.stopPropagation(); deleteTemplate(t.id); }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            <div className="mb-add-category-box">
              <input 
                type="text" 
                className="mb-add-category-input"
                placeholder="New Template..."
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createTemplate()}
              />
              <button className="mb-add-category-btn" onClick={createTemplate}>
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN: Template Editor */}
        <div style={{ gridColumn: 'span 2' }}>
          {activeTemplate ? (
            <div>
              <div className="mb-form-header">
                <div className="mb-form-header-left">
                  <div className="mb-form-header-title">
                    <h2>{activeTemplate.name}</h2>
                    <p>Configure reusable customization groups and options</p>
                  </div>
                </div>
                <button className="tables-btn-primary" onClick={() => setIsAddingGroup(true)} disabled={isAddingGroup}>
                  <Plus size={16} style={{ marginRight: '6px' }} /> Add Group
                </button>
              </div>

              <div className="mb-form-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* INLINE ADD GROUP FORM */}
                {isAddingGroup && (
                  <div style={{ border: '2px dashed var(--color-accent)', borderRadius: '12px', padding: '16px', background: 'rgba(255,109,0,0.02)' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-accent)' }}>Add New Customization Group</h4>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ flex: 2 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Group Name</label>
                        <input type="text" className="mb-input-text" placeholder="e.g. Size, Crust, Add-ons" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} autoFocus />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Selection Type</label>
                        <select className="mb-input-text" value={newGroup.selection_type} onChange={e => setNewGroup({...newGroup, selection_type: e.target.value})}>
                          <option value="radio">Radio (Single)</option>
                          <option value="checkbox">Checkbox (Multiple)</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="quantity">Quantity</option>
                          <option value="text">Text Instructions</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <label className="mb-switch" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" checked={newGroup.is_required} onChange={e => setNewGroup({...newGroup, is_required: e.target.checked})} />
                        <span className="slider round"></span>
                        <span style={{ fontSize: '0.9rem' }}>Required</span>
                      </label>
                      <div style={{ flex: 1, display: 'flex', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Min</span>
                          <input type="number" className="mb-input-text" style={{ width: '60px', padding: '4px 8px' }} value={newGroup.min_selections} onChange={e => setNewGroup({...newGroup, min_selections: parseInt(e.target.value) || 0})} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Max</span>
                          <input type="number" className="mb-input-text" style={{ width: '60px', padding: '4px 8px' }} placeholder="∞" value={newGroup.max_selections || ''} onChange={e => setNewGroup({...newGroup, max_selections: parseInt(e.target.value) || null})} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setIsAddingGroup(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--color-text-main)', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSaveGroup} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-accent)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={14} /> Save Group</button>
                      </div>
                    </div>
                  </div>
                )}

                {groups.length === 0 && !isAddingGroup ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    <Settings size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <h3>No groups yet</h3>
                    <p>Add customization groups like "Size" or "Toppings" to this template.</p>
                  </div>
                ) : (
                  groups.map(group => {
                    const isExpanded = expandedGroups.has(group.id);
                    const groupOptions = options.filter(o => o.group_id === group.id);
                    const isAddingOpt = addingOptionToGroup === group.id;
                    
                    return (
                      <div key={group.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--color-surface)' }}>
                        {/* Group Header */}
                        <div 
                          style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                          onClick={() => toggleGroup(group.id)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600, fontSize: '1rem' }}>{group.name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                {ICONS[group.selection_type]}
                                <span style={{ textTransform: 'capitalize' }}>{group.selection_type}</span>
                                {group.is_required && <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Required</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="mb-cat-btn delete" onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}><Trash2 size={14} /></button>
                          </div>
                        </div>

                        {/* Options List */}
                        {isExpanded && (
                          <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)' }}>
                            
                            {groupOptions.map(opt => (
                              <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span className="mb-drag-handle">:::</span>
                                  <span style={{ fontWeight: 500 }}>{opt.name}</span>
                                  {opt.is_default && <span style={{ fontSize: '0.7rem', background: 'var(--color-accent)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>Default</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                  <span style={{ color: opt.price_value > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: opt.price_value > 0 ? 600 : 400 }}>
                                    {opt.price_value > 0 ? `+₹${opt.price_value}` : (opt.price_type === 'free' ? 'Free' : '₹0.00')}
                                  </span>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button className="mb-cat-btn delete" onClick={(e) => { e.stopPropagation(); deleteOption(opt.id); }}><Trash2 size={14} /></button>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* INLINE ADD OPTION FORM */}
                            {isAddingOpt ? (
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginTop: '12px' }}>
                                <input type="text" className="mb-input-text" placeholder="Option Name (e.g. Extra Cheese)" style={{ flex: 2 }} value={newOption.name} onChange={e => setNewOption({...newOption, name: e.target.value})} autoFocus />
                                
                                <select className="mb-input-text" style={{ flex: 1 }} value={newOption.price_type} onChange={e => setNewOption({...newOption, price_type: e.target.value})}>
                                  <option value="fixed">Fixed Price (+₹)</option>
                                  <option value="free">Free</option>
                                  <option value="percentage">Percentage (+%)</option>
                                </select>
                                
                                {newOption.price_type !== 'free' && (
                                  <input type="number" className="mb-input-text" placeholder="Price" style={{ flex: 1 }} value={newOption.price_value || ''} onChange={e => setNewOption({...newOption, price_value: e.target.value})} />
                                )}

                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                  <input type="checkbox" checked={newOption.is_default} onChange={e => setNewOption({...newOption, is_default: e.target.checked})} /> Default
                                </label>

                                <button onClick={() => setAddingOptionToGroup(null)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={18} /></button>
                                <button onClick={() => handleSaveOption(group.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--color-accent)', color: 'white', cursor: 'pointer' }}>Save</button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setAddingOptionToGroup(group.id)}
                                style={{ marginTop: '12px', padding: '8px 12px', background: 'transparent', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--color-text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                              >
                                <Plus size={14} /> Add Option
                              </button>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
              Select or create a template to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;
