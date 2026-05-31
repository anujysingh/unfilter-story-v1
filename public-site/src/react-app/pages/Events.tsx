import { Calendar, MapPin, Users, ArrowRight, Mic, Video } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function Events() {
  const upcomingEvents = [
    {
      title: "Startup Failure Stories Night",
      date: "May 15, 2026",
      time: "6:00 PM - 9:00 PM",
      location: "91 Springboard, Koramangala, Bangalore",
      description: "An intimate evening of raw, unfiltered stories from founders who've failed and lived to tell the tale. No pitches, no networking—just real conversations.",
      attendees: 45,
      capacity: 60,
      type: "Live Panel",
      speakers: ["Priya Sharma", "Vikram Shah", "Ananya Reddy"],
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    },
    {
      title: "Reality Check: Founder Roundtable",
      date: "May 22, 2026",
      time: "7:00 PM - 10:00 PM",
      location: "WeWork, BKC, Mumbai",
      description: "Intimate roundtable discussion on the realities of building in India's startup ecosystem. Limited to 30 founders only.",
      attendees: 28,
      capacity: 30,
      type: "Roundtable",
      speakers: ["Rohan Gupta", "Meera Joshi"],
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=400&fit=crop",
    },
    {
      title: "The Pivot Playbook Workshop",
      date: "June 5, 2026",
      time: "2:00 PM - 6:00 PM",
      location: "T-Hub, Hyderabad",
      description: "Learn from founders who successfully pivoted and saved their companies. Interactive workshop with real case studies and actionable frameworks.",
      attendees: 52,
      capacity: 80,
      type: "Workshop",
      speakers: ["Karan Malhotra", "Sanjay Patel", "Neha Kapoor"],
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    },
    {
      title: "Fundraising Reality Check",
      date: "June 18, 2026",
      time: "5:00 PM - 8:00 PM",
      location: "NASSCOM 10000 Startups, Delhi",
      description: "What investors won't tell you—straight talk from founders who've raised money and VCs who've seen it all. Recorded for our podcast.",
      attendees: 67,
      capacity: 100,
      type: "Panel + Recording",
      speakers: ["Amit Sharma", "Rajesh Kumar"],
      image: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800&h=400&fit=crop",
    },
  ];

  const pastEvents = [
    {
      title: "Behind the Shutdown",
      date: "April 10, 2026",
      location: "Bangalore",
      attendees: 58,
      recording: true,
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=300&fit=crop",
    },
    {
      title: "Co-Founder Breakups",
      date: "March 25, 2026",
      location: "Mumbai",
      attendees: 42,
      recording: true,
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=300&fit=crop",
    },
    {
      title: "The First 100 Customers",
      date: "March 12, 2026",
      location: "Delhi",
      attendees: 75,
      recording: true,
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=300&fit=crop",
    },
    {
      title: "Burn Rate Reality",
      date: "February 28, 2026",
      location: "Pune",
      attendees: 35,
      recording: false,
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=300&fit=crop",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <section className="relative bg-gradient-to-br from-[#111111] via-[#1a1a1a] to-[#111111] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#FF4D8D] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#FF7A18] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-4">Events</h1>
            <p className="text-2xl text-gray-300">
              Real conversations with real founders—no BS, no sales pitches
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-7 h-7 text-[#FF4D8D]" />
            <h2 className="text-4xl font-bold text-[#111111]">Upcoming Events</h2>
          </div>
          <div className="space-y-8">
            {upcomingEvents.map((event, i) => (
              <article
                key={i}
                className="bg-white rounded-2xl border-2 border-[#EAEAEA] overflow-hidden hover:border-[#FF4D8D] hover:shadow-2xl transition-all group"
              >
                <div className="md:flex">
                  <div className="md:w-2/5 relative overflow-hidden">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover min-h-[400px] group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      {event.type.includes("Recording") ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                      {event.type}
                    </div>
                  </div>
                  <div className="md:w-3/5 p-8 flex flex-col justify-between">
                    <div>
                      <h3 className="text-3xl font-bold text-[#111111] mb-4 group-hover:text-[#FF4D8D] transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-[#6B6B6B] mb-6 leading-relaxed text-lg">
                        {event.description}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-start gap-3 text-[#6B6B6B]">
                          <Calendar className="w-5 h-5 text-[#FF4D8D] mt-1" />
                          <div>
                            <div className="font-semibold text-[#111111]">{event.date}</div>
                            <div className="text-sm">{event.time}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-[#6B6B6B]">
                          <MapPin className="w-5 h-5 text-[#FF4D8D] mt-1" />
                          <div className="font-medium text-[#111111]">{event.location}</div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-[#6B6B6B] mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#FF4D8D]" />
                            <span>
                              {event.attendees} / {event.capacity} registered
                            </span>
                          </div>
                          <span className="font-medium text-[#111111]">
                            {Math.round((event.attendees / event.capacity) * 100)}% full
                          </span>
                        </div>
                        <div className="w-full bg-[#EAEAEA] h-3 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] h-full rounded-full transition-all"
                            style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="mb-6">
                        <p className="text-sm text-[#6B6B6B] mb-2 font-medium">Featured Speakers</p>
                        <div className="flex flex-wrap gap-2">
                          {event.speakers.map((speaker, idx) => (
                            <span
                              key={idx}
                              className="bg-[#FAFAFA] text-[#111111] px-3 py-1 rounded-full text-sm border border-[#EAEAEA]"
                            >
                              {speaker}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-8 py-4 rounded-full hover:shadow-2xl hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 group/btn font-medium text-lg">
                      Register Now
                      <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4D8D] to-transparent" />
            <h2 className="text-4xl font-bold text-[#111111]">Past Events</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FF4D8D] to-transparent" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {pastEvents.map((event, i) => (
              <article
                key={i}
                className="bg-white rounded-2xl border-2 border-[#EAEAEA] overflow-hidden hover:border-[#FF4D8D] hover:shadow-lg hover:scale-[1.02] transition-all group cursor-pointer"
              >
                <div className="relative">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.title}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {event.recording && (
                    <div className="absolute top-4 right-4 bg-[#111111]/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Recording Available
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#111111] mb-3 group-hover:text-[#FF4D8D] transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[#6B6B6B] text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-[#EAEAEA] flex items-center justify-between">
                    <span className="text-sm text-[#6B6B6B] flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.attendees} attended
                    </span>
                    {event.recording && (
                      <span className="text-[#FF4D8D] font-medium text-sm flex items-center gap-1">
                        Watch Recording
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-r from-[#111111] to-[#2A2A2A] py-20 mt-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#FF4D8D] rounded-full blur-3xl" />
          <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-[#FF7A18] rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center text-white relative">
          <h2 className="text-5xl font-bold mb-6">Host an Event with Us</h2>
          <p className="text-xl mb-8 text-gray-300 leading-relaxed">
            Have a story to share or topic to discuss? We're always looking for real founders
            with real experiences to bring their truth to our community.
          </p>
          <button className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A18] text-white px-10 py-5 rounded-full hover:shadow-2xl hover:shadow-pink-500/50 transition-all text-lg font-medium">
            Propose an Event
          </button>
        </div>
      </section>
    </div>
  );
}
