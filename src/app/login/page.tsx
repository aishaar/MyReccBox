import { redirect } from 'next/navigation'

// Login now lives at /user. Keep /login working for any existing links.
export default function LoginPage() {
  redirect('/user')
}
