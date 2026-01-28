'use client'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/src/components/ui/other - shadcn/card'
import { useForm } from 'react-hook-form'
import { useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form/form'
import { Input } from '@/src/components/ui/other - shadcn/input'
import { Button } from '@/src/components/ui/buttons/button'
import { Textarea } from '@/src/components/ui/other - shadcn/textarea'
import { LoadingSpinner } from '@/src/components/ui/loading_spinner/loading_spinner'
import { contactFormSchema } from '@/src/lib/validations/auth'
import { ContactFormInput } from '@/src/lib/validations/auth'
import { sendContactEmail } from '@/src/app/api/send-email/actions'

export default function ContactSection() {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const form = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      message: '',
    },
  })

  function onSubmit(data: ContactFormInput) {
    setStatus(null)
    startTransition(async () => {
      try {
        //'await' pauses THIS function, but yields control back to main thread
        const response = await sendContactEmail(data)
        //Resumes here only when promise resolves
        if (response.success) {
          setStatus({ type: 'success', message: response.message })
          form.reset()
        } else {
          setStatus({ type: 'error', message: response.message })
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred'
        setStatus({ type: 'error', message: message })
      }
    })
  }

  return (
    <section id="contact" className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      <div>
        <Image
          src="/images/front image.png"
          alt="Contact Image"
          width={500}
          height={500}
          className="object-cover w-full h-full"
        />
      </div>

      <Card className="bg-muted/60 dark:bg-card">
        <CardHeader className="text-primary text-2xl"> </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid w-full gap-4"
            >
              <div className="flex flex-col md:!flex-row gap-8">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Leopoldo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Miranda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="leomirandadev@gmail.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Your message..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button className="bg-gradient-to-r from-[#D247BF] to-primary hover:from-pink-500 hover:to-purple-500">
                {isPending && <LoadingSpinner size={16} color="blue" />}
                {isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Form>
          {status ? (
            <div
              className={`flex justify-center mt-2 ${status.type === 'error' ? 'text-red-600' : 'text-green-600'}`}
            >
              {status.message}
            </div>
          ) : null}
        </CardContent>

        <CardFooter></CardFooter>
      </Card>
    </section>
  )
}
