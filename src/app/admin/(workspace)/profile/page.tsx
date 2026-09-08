import { updateProfileAction } from "@/actions/portfolio";
import { ProfileForm } from "@/components/admin/content-forms";
import { defaultProfile } from "@/lib/portfolio/default-data";
import { getProfile } from "@/lib/portfolio/repository";
export default async function ProfilePage() { let profile = defaultProfile; try { profile = (await getProfile()) || defaultProfile; } catch { /* The form remains useful as a setup preview; saving reports the configuration error. */ } return <ProfileForm profile={profile} action={updateProfileAction} />; }
