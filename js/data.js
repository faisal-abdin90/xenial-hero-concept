/* Service content, taken from xenialevents.com service pages.
   Each service owns a colour world: bg floods the page, ink is text, accent is highlights. */
window.XE = window.XE || {};

XE.services = [
  {
    id: 'staffing',
    name: 'Staffing',
    long: 'Event staffing',
    theme: { bg: '#F26F22', ink: '#1A0B03', accent: '#FFF1E4' },
    desc: 'Hostesses, promoters, registration crews and multilingual teams. Briefed on your brand, uniformed and supervised on your floor.',
    stats: [['8,700+', 'collaborators deployed'], ['100+', 'nationalities on the roster'], ['500+', 'events and shows staffed']],
    page: {
      kicker: 'Where we started, seven years ago',
      items: [
        ['Hostesses and hosts', 'Front-of-house faces for welcome desks, VIP lounges and stand hospitality.', 'Front of house'],
        ['Promoters and brand ambassadors', 'On-brand talent to drive footfall, sampling and product engagement.', 'Activation'],
        ['Registration and accreditation', 'Badge printing, check-in and accreditation desk teams.', 'Registration'],
        ['Ushers and crowd management', 'Trained crew to guide guests, manage queues and keep flow safe.', 'Crowd flow'],
        ['Multilingual staff and interpreters', 'Arabic, English and many more for international audiences and VIPs.', 'Languages'],
        ['Supervisors and team leaders', 'On-site managers who own scheduling, briefing and your single point of contact.', 'Management']
      ],
      stats: [['8,700+', 'collaborators deployed'], ['5,500+', 'freelancers on call'], ['500+', 'events and shows staffed'], ['100+', 'nationalities on the roster']],
      extra: { type: 'marquee', title: 'On the floor at', items: ['Gulfood', 'ADIPEC', 'GITEX Global', 'Big 5', 'Dubai Airshow', 'Comic Con', 'IUCN 2025', 'WETEX'] }
    },
    gantt: { from: 3.4, to: 6, note: 'recruit, brief, deploy' }
  },
  {
    id: 'permits',
    name: 'Permits',
    long: 'Event permits',
    theme: { bg: '#E9DDC3', ink: '#13213F', accent: '#D3263A' },
    desc: 'DTCM permits in Dubai and DCT approvals in Abu Dhabi, plus Dubai Sports Council licensing, performer registration and venue liaison.',
    stats: [['1,000+', 'speakers registered for IUCN 2025'], ['12', 'major venues we file permits for'], ['2', 'emirates: Dubai and Abu Dhabi']],
    page: {
      kicker: 'Dubai and Abu Dhabi approvals, handled',
      items: [
        ['Concerts and live shows', 'Arena and outdoor ticketed shows, with artist clearances and audience-safety documentation.', 'DTCM, venue permit'],
        ['Exhibitions and trade shows', 'Large expos and trade shows, including DWTC floorplan approvals and exhibitor documentation.', 'DWTC permit'],
        ['Conferences and summits', 'Corporate meetings, forums and conferences across Dubai and Abu Dhabi venues.', 'DTCM, DCT permit'],
        ['Sports events', 'Marathons, tournaments, fitness activations and community sport through Dubai Sports Council.', 'DSC permit'],
        ['Festivals and activations', 'Brand activations, ticketed festivals and public events.', 'DTCM, DCT permit'],
        ['Speakers and entertainers', 'Every person on stage licensed and approved. We registered 1,000+ speakers for IUCN 2025.', 'Performer registration']
      ],
      stats: [['1,000+', 'speakers registered for one event'], ['12', 'major venues we file for'], ['4', 'authorities: DTCM, DCT, DSC, DWTC'], ['2', 'emirates covered']],
      extra: { type: 'marquee', title: 'Venues we register permits in', items: ['Coca-Cola Arena', 'Dubai World Trade Centre', 'Expo City Dubai', 'Madinat Jumeirah', 'Dubai Opera', 'Festival Arena', 'Atlantis The Palm', 'Etihad Arena', 'ADNEC', 'Yas Island', 'Emirates Palace', 'Louvre Abu Dhabi'] }
    },
    gantt: { from: 0, to: 5.1, note: 'applications, approvals, performer registration' }
  },
  {
    id: 'it',
    name: 'Event IT',
    long: 'Event IT and registration',
    theme: { bg: '#1F3FD6', ink: '#F2F5FF', accent: '#8EF0FF' },
    desc: 'Badge printers, scanners, tablets and event WiFi, plus the people who run registration from the first test print to the final data export.',
    stats: [['250K+', 'attendee registrations processed'], ['2,500+', 'devices deployed each year'], ['24 hrs', 'to mobilise and set up on site']],
    page: {
      kicker: 'Hardware and the team that runs it',
      items: [
        ['Registration desks', 'Desk layout, cable-matted power, printers and scanners imaged and driver-matched.', 'Build'],
        ['Badge printing and accreditation', 'Badges printed through the arrival peak, with on-the-spot reprints.', 'Show'],
        ['Access control', 'Session scanning and zone entry, with numbers reported through the day.', 'Show'],
        ['Event WiFi and network', 'VLAN separation and cellular failover in place before doors open.', 'Build'],
        ['Equipment rental', 'Badge printers, scanners, tablets, laptops and touchscreens, by the day or the season.', 'Rental'],
        ['Data and reporting', 'Final registration export, asset reconciliation and a post-event debrief.', 'Strike']
      ],
      stats: [['250K+', 'registrations processed'], ['2,500+', 'devices deployed a year'], ['24 hrs', 'mobilisation and setup'], ['3', 'countries: UAE, KSA, Qatar']],
      extra: { type: 'steps', title: 'Three phases, no handover gaps', items: [
        ['Build', 'Before doors open', 'Desks, devices, badge artwork and network tested end to end, then a dry run with your team.'],
        ['Show', 'Live operation', 'A named lead and technicians on the floor, badge printing through the peak, access control live.'],
        ['Strike', 'After the last visitor', 'Full dismantle, asset reconciliation, data export and the venue handed back clean.']
      ] }
    },
    gantt: { from: 2.6, to: 7, note: 'build, show, strike' }
  },
  {
    id: 'production',
    name: 'Production',
    long: 'Branding and production',
    theme: { bg: '#FFC21A', ink: '#17130A', accent: '#E8461E' },
    desc: '3D venue renders, custom stands and stage sets, large-format graphics and premium collateral, built and broken down by our own production managers.',
    stats: [['3D', 'walk the space before anything is built'], ['4', 'disciplines under one roof'], ['300GSM', 'anti-tear badge stock, sourced to spec']],
    page: {
      kicker: 'From render to raw build',
      items: [
        ['Creative design and 3D visualisation', 'Event concepts, mood boards and realistic venue renders.', 'Design'],
        ['Custom set fabrication', 'Stage builds, exhibition stands, display booths and entrance structures.', 'Fabrication'],
        ['Environmental graphics', 'Booth wraps, large-format graphics and wall coverings.', 'Graphics'],
        ['Event collateral', 'Custom lanyards, badges, wristbands and branded crew apparel.', 'Collateral'],
        ['Production management', 'Safety compliance, contractor coordination, strict timelines and venue restoration.', 'Management']
      ],
      stats: [['3D', 'venue renders before fabrication'], ['4', 'disciplines under one roof'], ['300GSM', 'anti-tear badge stock'], ['CR80', 'PVC cards, desk-ready']],
      extra: { type: 'steps', title: 'A disciplined path from render to breakdown', items: [
        ['Render', 'Creative and 3D', 'Walk through the space before any fabrication begins.'],
        ['Fabricate', 'Sets and graphics', 'Stage sets, booth wraps and large-format environmental graphics.'],
        ['Build', 'Execution and logistics', 'On-site build, safety risk assessments and rapid, clean breakdown.']
      ] }
    },
    gantt: { from: 1, to: 7, note: 'render, fabricate, build, break down' }
  },
  {
    id: 'media',
    name: 'Media',
    long: 'Media services',
    theme: { bg: '#2B0B12', ink: '#FFE9E3', accent: '#FF3D2E' },
    desc: 'Photography, 4K videography and live multi-camera broadcast for exhibitions, summits and activations, shot by one coordinated crew.',
    stats: [['4K', 'multi-camera highlight reels'], ['Live', 'broadcast, streaming and IMAG'], ['1 crew', 'for stills and motion']],
    page: {
      kicker: 'A full media unit, embedded in your event',
      items: [
        ['Media team prep', 'Shot lists, livestream prep and crew briefing before the doors open.', 'Production'],
        ['Event photography', 'Discreet, high-resolution coverage, colour-managed and ready for press.', 'Photography'],
        ['Event videography', 'Keynotes, candids, delegates and brand moments as they happen.', 'Field'],
        ['Broadcasting', 'Live multi-camera setup, vision mixing and switching for hybrid audiences.', 'Broadcast'],
        ['Highlight reels', '4K reels edited and graded to a broadcast standard.', 'Post'],
        ['Interviews and PR', 'Speaker and delegate interviews for press and social.', 'PR']
      ],
      stats: [['4K', 'multi-camera coverage'], ['Live', 'broadcast and IMAG'], ['1', 'crew for stills and motion'], ['3', 'teams: prep, field, broadcast']],
      extra: { type: 'marquee', title: 'Recent coverage', items: ['Global Rail', 'World Health Expo 2026', 'Middle East Business Leaders Summit', 'Government summits, Abu Dhabi', 'Gulfood'] }
    },
    gantt: { from: 4.4, to: 8, note: 'prep, live coverage, edit and delivery' }
  },
  {
    id: 'coordination',
    name: 'Coordination',
    long: 'Event coordinators',
    theme: { bg: '#1FB2AA', ink: '#03211F', accent: '#F4FFFE' },
    desc: 'Onsite and virtual coordinators who own the run sheet, the vendors, the guest flow and the curveballs, from setup to breakdown.',
    stats: [['1', 'point of contact on the day'], ['4', 'countries: UAE, KSA, Qatar, UK'], ['2', 'modes: onsite and virtual']],
    page: {
      kicker: 'The person who knows the whole run sheet',
      items: [
        ['Venue and logistics', 'Setup supervision, vendors, staff and timelines through to breakdown.', 'Physical'],
        ['Virtual and hybrid moderation', 'Platform setup, speaker onboarding, live moderation and troubleshooting.', 'Digital'],
        ['VIP and protocol', 'Arrivals, protocol handling and guest flow for senior delegates.', 'Protocol'],
        ['Staff briefings and deployment', 'Crews briefed, deployed and moved as the day changes.', 'People'],
        ['Contingency handling', 'Issues resolved in real time, before guests notice.', 'Control'],
        ['Regional oversight', 'Coordinators who know protocol and regulation across the region.', 'Regional']
      ],
      stats: [['1', 'point of contact'], ['4', 'countries covered'], ['2', 'modes: onsite and virtual'], ['Setup', 'through to breakdown']],
      extra: { type: 'marquee', title: 'Where our coordinators work', items: ['United Arab Emirates', 'Saudi Arabia', 'Qatar', 'United Kingdom'] }
    },
    gantt: { from: 1.2, to: 7, note: 'planning, run sheet, live ops, breakdown' }
  }
];

XE.ganttCols = ['8 wks out', '6 wks', '4 wks', '2 wks', 'Build', 'Show', 'Strike', 'After'];
XE.ganttOrder = ['permits', 'production', 'coordination', 'it', 'staffing', 'media'];
XE.shows = ['Gulfood', 'ADIPEC', 'GITEX Global', 'Big 5 Global', 'Dubai Airshow', 'Comic Con', 'IUCN 2025', 'WETEX', 'Expand North Star', 'Global Rail'];
