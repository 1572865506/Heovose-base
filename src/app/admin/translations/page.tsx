
"use client";

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  Loader2, 
  Check, 
  X,
  Languages
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Label } from '@/components/ui/label';

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
}

export default function TranslationsPage() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ id: '', en: '', zh: '' });

  // 1. Fetch Translations
  const translationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'localizedStrings');
  }, [firestore]);

  const { data: translations, isLoading } = useCollection<LocalizedString>(translationsQuery);

  // 2. Filter Logic
  const filteredTranslations = useMemo(() => {
    if (!translations) return [];
    return translations.filter(t => 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.zh.includes(searchQuery)
    );
  }, [translations, searchQuery]);

  // 3. Actions
  const handleSave = () => {
    if (!firestore || !formData.id) return;
    
    const docRef = doc(firestore, 'localizedStrings', formData.id);
    setDocumentNonBlocking(docRef, {
      id: formData.id,
      en: formData.en,
      zh: formData.zh,
      updatedAt: serverTimestamp()
    }, { merge: true });

    setIsAdding(false);
    setEditingId(null);
    setFormData({ id: '', en: '', zh: '' });
  };

  const handleDelete = (id: string) => {
    if (!firestore || !confirm('Are you sure you want to delete this translation? This may break referenced content.')) return;
    const docRef = doc(firestore, 'localizedStrings', id);
    deleteDocumentNonBlocking(docRef);
  };

  const startEdit = (t: LocalizedString) => {
    setFormData(t);
    setEditingId(t.id);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <Languages className="h-6 w-6" />
            Translation Management
          </h2>
          <p className="text-sm text-muted-foreground">Manage multi-language strings used across the website.</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 px-6 font-bold uppercase tracking-widest gap-2">
              <Plus className="h-4 w-4" /> Add String
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Localized String</DialogTitle>
              <DialogDescription>
                Create a unique ID to reference this text in other entities.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="id" className="text-[10px] font-bold uppercase">String ID (Unique Key)</Label>
                <Input 
                  id="id" 
                  placeholder="e.g., hero_headline" 
                  value={formData.id} 
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="en" className="text-[10px] font-bold uppercase">English Content</Label>
                <Input 
                  id="en" 
                  value={formData.en} 
                  onChange={e => setFormData({...formData, en: e.target.value})}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zh" className="text-[10px] font-bold uppercase">Chinese Content</Label>
                <Input 
                  id="zh" 
                  value={formData.zh} 
                  onChange={e => setFormData({...formData, zh: e.target.value})}
                  className="rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdding(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSave} className="rounded-xl">Save Translation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID or content..." 
            className="pl-10 border-none bg-transparent focus-visible:ring-0 text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Badge variant="secondary" className="rounded-lg px-3 py-1 font-bold">
          {filteredTranslations.length} Keys
        </Badge>
      </div>

      <div className="bg-white rounded-2xl border border-border/40 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[30%] font-bold uppercase text-[10px] tracking-widest pl-6">String ID</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">English (EN)</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Chinese (ZH)</TableHead>
              <TableHead className="w-[100px] text-right pr-6 font-bold uppercase text-[10px] tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-50">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Syncing Cloud Data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTranslations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic">
                  No translations found. Add your first string to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredTranslations.map((t) => (
                <TableRow key={t.id} className="group hover:bg-muted/5 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-primary pl-6">
                    {t.id}
                  </TableCell>
                  <TableCell>
                    {editingId === t.id ? (
                      <Input 
                        value={formData.en} 
                        onChange={e => setFormData({...formData, en: e.target.value})}
                        className="h-8 text-sm rounded-lg"
                      />
                    ) : (
                      <span className="text-sm">{t.en}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === t.id ? (
                      <Input 
                        value={formData.zh} 
                        onChange={e => setFormData({...formData, zh: e.target.value})}
                        className="h-8 text-sm rounded-lg"
                      />
                    ) : (
                      <span className="text-sm font-medium">{t.zh}</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === t.id ? (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={handleSave}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/5" onClick={() => setEditingId(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => startEdit(t)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/5" onClick={() => handleDelete(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
