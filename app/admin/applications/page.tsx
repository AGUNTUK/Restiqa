import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { approveHostApplication, rejectHostApplication } from "@/app/actions/admin";
import Link from "next/link";

export default async function AdminApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: applications } = await supabase
    .from("host_applications")
    .select("*, users(name, email, avatar_url), listings(*)")
    .order("created_at", { ascending: false });

  const pendingCount = applications?.filter(a => a.status === 'pending').length || 0;

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#1a202c] mb-2 tracking-tight">Host Applications</h1>
          <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Review and manage registration requests ({pendingCount} pending)</p>
        </div>
      </div>

      {!applications || applications.length === 0 ? (
        <div className="neo-inset p-20 rounded-[40px] text-center">
          <span className="text-6xl mb-4 block">📋</span>
          <h3 className="text-xl font-bold text-[#1a202c]">No applications yet</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map((app) => (
            <div key={app.id} className="neo-card p-8 rounded-[32px] border border-white/40 flex flex-col lg:flex-row gap-8 items-start relative overflow-hidden">
              
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-md ${
                  app.status === 'approved' ? 'bg-green-100 text-green-600' : 
                  app.status === 'pending' ? 'bg-amber-100 text-amber-600 animate-pulse' : 
                  'bg-red-100 text-red-600'
                }`}>
                  {app.status}
                </span>
              </div>

              {/* User Section */}
              <div className="w-full lg:w-1/4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d32f2f] to-[#8bc1c1] p-[2px] shadow-lg">
                    <img 
                      src={(app.users as any)?.avatar_url || `https://ui-avatars.com/api/?name=${(app.users as any)?.name}`} 
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                      alt="avatar"
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-[#1a202c] text-lg">{(app.users as any)?.name}</h4>
                    <p className="text-xs font-bold text-[#a0aec0]">{(app.users as any)?.email}</p>
                  </div>
                </div>
                <div className="neo-inset p-4 rounded-xl space-y-2">
                  <p className="text-[10px] font-black text-[#a0aec0] uppercase tracking-widest">Phone</p>
                  <p className="text-sm font-bold text-[#2a6b78]">{app.phone || 'N/A'}</p>
                  <p className="text-[10px] font-black text-[#a0aec0] uppercase tracking-widest mt-2">Experience</p>
                  <p className="text-sm font-bold text-[#d32f2f] capitalize">{app.experience || 'New'}</p>
                </div>
              </div>

              {/* Property Preview Section */}
              <div className="flex-1 w-full neo-inset p-6 rounded-2xl bg-white/50 space-y-4">
                <h5 className="text-xs font-black text-[#a0aec0] uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Proposed First Listing</h5>
                {app.listings ? (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden shadow-md">
                      <img src={(app.listings as any).images?.[0]} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h6 className="font-black text-[#1a202c] text-lg">{(app.listings as any).title}</h6>
                      <p className="text-sm text-[#718096] font-medium line-clamp-2">{(app.listings as any).description}</p>
                      <div className="flex gap-4 pt-2">
                        <span className="text-xs font-black text-[#d32f2f] px-3 py-1 bg-red-50 rounded-lg capitalize">৳{(app.listings as any).price} / night</span>
                        <span className="text-xs font-black text-[#8bc1c1] px-3 py-1 bg-teal-50 rounded-lg capitalize">{(app.listings as any).type}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-500 font-bold italic">Listing record was deleted.</p>
                )}
              </div>

              {/* Actions Section */}
              <div className="w-full lg:w-48 space-y-3 pt-6 lg:pt-0">
                {app.status === 'pending' ? (
                  <>
                    <form action={approveHostApplication}>
                      <input type="hidden" name="applicationId" value={app.id} />
                      <button className="w-full py-4 rounded-2xl bg-[#43e97b] text-white text-xs font-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                        Approve Host
                      </button>
                    </form>
                    <form action={rejectHostApplication}>
                      <input type="hidden" name="applicationId" value={app.id} />
                      <input type="text" name="reason" placeholder="Reason (Optional)" className="w-full mb-2 p-2 text-[10px] rounded-lg border border-red-100 neo-inset focus:outline-none" />
                      <button className="w-full py-4 rounded-2xl bg-white text-red-500 text-xs font-black shadow-md border border-red-50 border-b-4 border-b-red-100 hover:bg-red-50 transition-all">
                        Reject
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center p-4 rounded-2xl border-2 border-dotted border-gray-100 text-[#a0aec0] font-bold text-xs uppercase italic">
                    Processed
                  </div>
                )}
                <Link href={`/listing/${(app.listings as any)?.slug}`} className="block w-full text-center py-2 text-[10px] font-black text-[#a0aec0] hover:text-[#d32f2f]">
                  Preview Listing Detail →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
