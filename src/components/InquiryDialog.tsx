'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from '@/hooks/use-translations';
import { Locale } from '@/lib/translations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(10, 'Minimum 10 characters'),
  website_url: z.string().optional(), // Honeypot
});

interface InquiryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  locale: Locale;
  productId?: string;
  productName?: string;
}

export function InquiryDialog({
  isOpen,
  onOpenChange,
  locale,
  productId,
  productName,
}: InquiryDialogProps) {
  const { t } = useTranslations(locale);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      message: productName ? `I am interested in ${productName}. ` : '',
      website_url: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          productId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit');
      }

      toast({
        title: t('INQUIRY_SUCCESS'),
        variant: 'default',
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-2xl border-white/20 shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="relative p-8 pt-10">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
              {t('INQUIRY_TITLE')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
              {productName ? `${t('product_contact_now')}: ${productName}` : t('footer_slogan2')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Honeypot Field - Hidden from humans */}
              <div className="hidden">
                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} tabIndex={-1} autoComplete="off" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t('INQUIRY_NAME')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field} 
                          className="h-11 rounded-xl bg-slate-50 border-slate-200/60 focus:bg-white transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t('INQUIRY_EMAIL')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="john@example.com" 
                          {...field} 
                          className="h-11 rounded-xl bg-slate-50 border-slate-200/60 focus:bg-white transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t('INQUIRY_PHONE')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+1..." 
                          {...field} 
                          className="h-11 rounded-xl bg-slate-50 border-slate-200/60 focus:bg-white transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t('INQUIRY_COMPANY')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Company Ltd." 
                          {...field} 
                          className="h-11 rounded-xl bg-slate-50 border-slate-200/60 focus:bg-white transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {t('INQUIRY_MESSAGE')}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="..." 
                        {...field} 
                        className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-200/60 focus:bg-white transition-all resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold tracking-widest uppercase text-xs gap-3 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? t('INQUIRY_SENDING') : t('INQUIRY_SUBMIT')}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
