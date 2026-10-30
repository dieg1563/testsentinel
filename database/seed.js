const db = require('./db')

function seed () {
  const count = db.prepare('SELECT COUNT(*) as n FROM users').get()
  if (count.n > 0) return

  const insertUser = db.prepare(
    `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`
  )

  insertUser.run('admin', 'admin@supportdesk.local', 'Admin_123', 'admin')
  insertUser.run('jdupont', 'jdupont@supportdesk.local', 'User_123', 'user')
  insertUser.run('mmartin', 'mmartin@supportdesk.local', 'User_123', 'user')
  insertUser.run('tchamberlain', 'tchamberlain@supportdesk.local', 'User_123', 'user')
  insertUser.run('kwhite', 'kwhite@supportdesk.local', 'User_123', 'user')
  insertUser.run('rlee', 'rlee@supportdesk.local', 'User_123', 'user')
  insertUser.run('aperez', 'aperez@supportdesk.local', 'User_123', 'user')
  insertUser.run('sbrown', 'sbrown@supportdesk.local', 'User_123', 'user')
  insertUser.run('nlindqvist', 'nlindqvist@supportdesk.local', 'User_123', 'user')
  insertUser.run('helpdesk', 'helpdesk@supportdesk.local', 'Help_123', 'admin')

  const insertTicket = db.prepare(`
    INSERT INTO tickets (title, description, status, priority, created_by, assigned_to, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const tickets = [
    // Phase 1 originals -- translated to English
    { title: 'Network printer office 3 unreachable', description: 'The HP LaserJet in office 3 has not been responding since this morning. Workstations no longer detect it on the network.', status: 'in_progress', priority: 'urgent', created_by: 2, assigned_to: 1, created_at: '2025-04-22T08:14:00.000Z', updated_at: '2025-04-22T09:30:00.000Z' },
    { title: 'Cisco VPN fails to connect after update', description: 'Since last Friday\'s system update, Cisco AnyConnect refuses connections with error 403.', status: 'resolved', priority: 'high', created_by: 2, assigned_to: 10, created_at: '2025-04-25T10:02:00.000Z', updated_at: '2025-05-03T14:15:00.000Z' },
    { title: 'Access denied on HR network share', description: 'Marie Martin can no longer access the \\\\srv-files\\HR share from her workstation. Access was working yesterday.', status: 'open', priority: 'high', created_by: 3, assigned_to: null, created_at: '2025-05-07T07:45:00.000Z', updated_at: '2025-05-07T07:45:00.000Z' },
    { title: 'Blue screen on accounting workstation', description: 'Jean Moreau\'s PC (accounting) reboots on a blue screen with KERNEL_SECURITY_CHECK_FAILURE error.', status: 'in_progress', priority: 'medium', created_by: 2, assigned_to: 1, created_at: '2025-05-12T13:20:00.000Z', updated_at: '2025-05-13T09:00:00.000Z' },
    { title: 'New badge access request -- server room', description: 'A new network contractor needs access to the server room this week. Temporary badge required.', status: 'closed', priority: 'low', created_by: 3, assigned_to: 1, created_at: '2025-05-15T11:00:00.000Z', updated_at: '2025-05-16T08:30:00.000Z' },
    { title: 'Accounting software crashes on startup', description: 'Sage 100 displays a database error on launch on 3 workstations in the accounting department since this morning.', status: 'in_progress', priority: 'medium', created_by: 2, assigned_to: 10, created_at: '2025-05-20T08:55:00.000Z', updated_at: '2025-05-21T10:10:00.000Z' },
    { title: 'Windows update stuck in loop', description: 'Windows Update remains stuck at 35% and reboots in a loop on S. Lefebvre\'s workstation.', status: 'open', priority: 'medium', created_by: 3, assigned_to: null, created_at: '2025-06-01T14:30:00.000Z', updated_at: '2025-06-01T14:30:00.000Z' },
    { title: 'Outlook mailbox full -- incoming emails rejected', description: 'p.durand@techco.local mailbox is full (2GB quota reached). New emails are being bounced.', status: 'resolved', priority: 'high', created_by: 2, assigned_to: 1, created_at: '2025-06-05T09:10:00.000Z', updated_at: '2025-06-06T11:45:00.000Z' },
    { title: 'IP phone not ringing after office move', description: 'The Cisco 7942 phone in office 12 stopped ringing after the sales team relocation.', status: 'open', priority: 'low', created_by: 3, assigned_to: null, created_at: '2025-06-10T15:00:00.000Z', updated_at: '2025-06-10T15:00:00.000Z' },
    { title: 'Slow internet on wired network', description: 'Since Monday morning, wired internet is very slow (under 2 Mbps measured). Wi-Fi is fine.', status: 'open', priority: 'medium', created_by: 2, assigned_to: null, created_at: '2025-06-15T08:00:00.000Z', updated_at: '2025-06-15T08:00:00.000Z' },
    // Phase 2 new tickets
    { title: 'Laptop won\'t boot after Windows update', description: 'Device gets stuck on the Windows logo after last night\'s automatic update. Cannot access recovery mode.', status: 'open', priority: 'high', created_by: 4, assigned_to: null, created_at: '2025-06-18T07:30:00.000Z', updated_at: '2025-06-18T07:30:00.000Z' },
    { title: 'Cannot access shared drive since password change', description: 'After resetting my domain password, I can no longer map the Z: drive. Getting error 0x80070035.', status: 'open', priority: 'medium', created_by: 5, assigned_to: null, created_at: '2025-06-20T09:15:00.000Z', updated_at: '2025-06-20T09:15:00.000Z' },
    { title: 'Outlook keeps crashing on startup', description: 'Outlook 2021 crashes immediately after the splash screen. Tried safe mode -- same result.', status: 'open', priority: 'medium', created_by: 6, assigned_to: null, created_at: '2025-06-22T10:00:00.000Z', updated_at: '2025-06-22T10:00:00.000Z' },
    { title: 'New employee workstation setup request', description: 'New joiner starting on Monday. Need standard workstation image deployed, accounts created, badge access for floor 2.', status: 'in_progress', priority: 'medium', created_by: 7, assigned_to: 10, created_at: '2025-06-25T14:00:00.000Z', updated_at: '2025-06-26T08:00:00.000Z' },
    { title: 'Webcam not recognized in Teams meetings', description: 'Built-in webcam works in other apps but Teams shows "No camera found". Tried reinstalling Teams.', status: 'open', priority: 'low', created_by: 8, assigned_to: null, created_at: '2025-07-01T11:30:00.000Z', updated_at: '2025-07-01T11:30:00.000Z' },
    { title: 'Wi-Fi drops every 30 minutes in open space', description: 'Multiple users on floor 3 report Wi-Fi disconnecting every 30 minutes exactly. Reconnects automatically.', status: 'open', priority: 'high', created_by: 9, assigned_to: null, created_at: '2025-07-03T08:45:00.000Z', updated_at: '2025-07-03T08:45:00.000Z' },
    { title: 'Scanner not showing up on the network', description: 'The Canon DR-C225 in the document room is unreachable. The IP address in the config panel is 0.0.0.0.', status: 'open', priority: 'medium', created_by: 4, assigned_to: null, created_at: '2025-07-05T13:00:00.000Z', updated_at: '2025-07-05T13:00:00.000Z' },
    { title: 'Mouse and keyboard unresponsive after sleep', description: 'USB peripherals stop responding after the PC wakes from sleep. Unplugging and replugging fixes it temporarily.', status: 'open', priority: 'low', created_by: 5, assigned_to: null, created_at: '2025-07-08T09:20:00.000Z', updated_at: '2025-07-08T09:20:00.000Z' },
    { title: 'Request for software license -- Adobe Acrobat', description: 'Our team needs a Pro license for PDF editing. Current Reader version does not support form creation.', status: 'open', priority: 'low', created_by: 6, assigned_to: null, created_at: '2025-07-10T10:30:00.000Z', updated_at: '2025-07-10T10:30:00.000Z' },
    { title: 'Email signature not applying on mobile', description: 'Outlook on iOS does not apply the corporate signature configured in OWA. Signature shows on desktop only.', status: 'open', priority: 'low', created_by: 7, assigned_to: null, created_at: '2025-07-12T14:45:00.000Z', updated_at: '2025-07-12T14:45:00.000Z' },
    { title: 'Server room temperature alarm triggered', description: 'BMS sent a temperature alert at 03:14 -- server room reached 28°C. AC unit 2 appears to be offline.', status: 'resolved', priority: 'urgent', created_by: 8, assigned_to: 1, created_at: '2025-07-15T03:14:00.000Z', updated_at: '2025-07-15T06:00:00.000Z' },
    { title: 'Backup job failed -- disk quota exceeded', description: 'Nightly backup to \\\\srv-backup\\daily failed at 02:30 with "quota exceeded". Last successful backup was 3 days ago.', status: 'open', priority: 'urgent', created_by: 9, assigned_to: null, created_at: '2025-07-18T06:00:00.000Z', updated_at: '2025-07-18T06:00:00.000Z' },
    { title: 'VoIP phone displays wrong extension', description: 'After the PBX migration, my deskphone shows extension 2041 but I should be on 2087. Calls go to wrong person.', status: 'open', priority: 'medium', created_by: 4, assigned_to: null, created_at: '2025-07-22T09:00:00.000Z', updated_at: '2025-07-22T09:00:00.000Z' },
    { title: 'Two-factor authentication not sending SMS', description: 'The MFA SMS code for VPN login is not being delivered to my phone. I checked -- number is correct in AD.', status: 'open', priority: 'high', created_by: 5, assigned_to: null, created_at: '2025-07-25T08:10:00.000Z', updated_at: '2025-07-25T08:10:00.000Z' },
    { title: 'Unable to print from Mac to network printer', description: 'My MacBook Pro cannot connect to the Canon LBP7110Cw. Windows users on the same floor print fine.', status: 'in_progress', priority: 'medium', created_by: 6, assigned_to: 10, created_at: '2025-08-01T11:00:00.000Z', updated_at: '2025-08-02T09:30:00.000Z' },
    { title: 'Monitor flickering on dock station', description: 'External monitor connected via Dell WD19 dock flickers intermittently. Tried two different cables.', status: 'open', priority: 'low', created_by: 7, assigned_to: null, created_at: '2025-08-05T14:15:00.000Z', updated_at: '2025-08-05T14:15:00.000Z' },
    { title: 'Antivirus flagging internal deployment tool', description: 'CrowdStrike is quarantining deploy.exe from our CI pipeline. False positive -- binary is signed and internal.', status: 'open', priority: 'high', created_by: 8, assigned_to: null, created_at: '2025-08-10T10:00:00.000Z', updated_at: '2025-08-10T10:00:00.000Z' },
    { title: 'Remote desktop connection timing out', description: 'RDP connections to srv-rds01 drop after exactly 15 minutes. GPO timeout policy may have changed.', status: 'resolved', priority: 'medium', created_by: 9, assigned_to: 1, created_at: '2025-08-14T09:30:00.000Z', updated_at: '2025-08-15T11:00:00.000Z' },
    { title: 'Guest Wi-Fi password needs to be rotated', description: 'Monthly rotation due. Current password posted on the lobby whiteboard is from March. Security risk.', status: 'open', priority: 'medium', created_by: 4, assigned_to: null, created_at: '2025-09-01T08:00:00.000Z', updated_at: '2025-09-01T08:00:00.000Z' },
    { title: 'USB ports disabled on finance workstations', description: 'After last week\'s security policy push, USB storage is blocked on all finance PCs. Need an exception for the audit team.', status: 'open', priority: 'medium', created_by: 5, assigned_to: null, created_at: '2025-09-08T10:45:00.000Z', updated_at: '2025-09-08T10:45:00.000Z' },
    { title: 'OneDrive sync conflict on shared folder', description: 'Marketing team folder has 47 "conflict" copies. Two users edited the same file offline simultaneously.', status: 'open', priority: 'low', created_by: 6, assigned_to: null, created_at: '2025-09-12T13:30:00.000Z', updated_at: '2025-09-12T13:30:00.000Z' },
    { title: 'Teams meeting rooms not showing in calendar', description: 'Room mailboxes disappeared from the Teams room finder after the Exchange Online migration last weekend.', status: 'in_progress', priority: 'high', created_by: 7, assigned_to: 1, created_at: '2025-09-15T08:00:00.000Z', updated_at: '2025-09-16T09:00:00.000Z' },
    { title: 'New joiner badge access -- marketing floor', description: 'Three new hires starting Monday need badge access to marketing floor (floor 4) and the bike room.', status: 'closed', priority: 'low', created_by: 8, assigned_to: 10, created_at: '2025-09-20T11:00:00.000Z', updated_at: '2025-09-22T14:00:00.000Z' },
    { title: 'Projector in meeting room B won\'t connect via HDMI', description: 'HDMI input on the BenQ projector shows "No signal" with any laptop. VGA adapter works but resolution is poor.', status: 'open', priority: 'medium', created_by: 9, assigned_to: null, created_at: '2025-10-01T09:00:00.000Z', updated_at: '2025-10-01T09:00:00.000Z' },
    { title: 'Internet browsing blocked on dev workstations', description: 'After the proxy reconfiguration, dev team workstations cannot reach npm registry or GitHub. CI is also broken.', status: 'open', priority: 'urgent', created_by: 4, assigned_to: null, created_at: '2025-10-05T08:30:00.000Z', updated_at: '2025-10-05T08:30:00.000Z' },
    { title: 'Citrix session disconnects after 10 minutes', description: 'Users on Citrix Virtual Apps report sessions dropping every 10 minutes. ICA Keep-Alive may need adjustment.', status: 'open', priority: 'medium', created_by: 5, assigned_to: null, created_at: '2025-10-10T14:00:00.000Z', updated_at: '2025-10-10T14:00:00.000Z' },
    { title: 'Keyboard layout switching randomly to AZERTY', description: 'My keyboard layout keeps switching to AZERTY randomly during calls. Language bar shortcut is likely triggered.', status: 'open', priority: 'low', created_by: 6, assigned_to: null, created_at: '2025-11-01T10:30:00.000Z', updated_at: '2025-11-01T10:30:00.000Z' },
    { title: 'Hard drive making clicking noises', description: 'My laptop HDD has been making loud clicking sounds since yesterday. Backup not done in 2 weeks.', status: 'open', priority: 'urgent', created_by: 7, assigned_to: null, created_at: '2025-11-10T08:15:00.000Z', updated_at: '2025-11-10T08:15:00.000Z' },
    { title: 'Software update notification won\'t dismiss', description: 'A Windows update notification bubble reappears every 15 minutes even after dismissing it. Very disruptive.', status: 'open', priority: 'low', created_by: 8, assigned_to: null, created_at: '2025-12-01T09:45:00.000Z', updated_at: '2025-12-01T09:45:00.000Z' },
    { title: 'Cannot install printer driver -- admin rights needed', description: 'Finance team received a new HP printer but cannot install the driver without local admin rights. Need an exception.', status: 'open', priority: 'medium', created_by: 9, assigned_to: null, created_at: '2025-12-10T13:00:00.000Z', updated_at: '2025-12-10T13:00:00.000Z' },
    { title: 'Mobile device management enrollment failing', description: 'Two iPhones cannot complete Intune MDM enrollment. Error: "Device limit exceeded" despite only 1 prior device.', status: 'open', priority: 'medium', created_by: 4, assigned_to: null, created_at: '2026-01-08T10:00:00.000Z', updated_at: '2026-01-08T10:00:00.000Z' },
    { title: 'Battery draining abnormally fast on laptop', description: 'Dell XPS 15 battery drops from 100% to 30% in under 2 hours. Was lasting 6+ hours before the last BIOS update.', status: 'open', priority: 'low', created_by: 5, assigned_to: null, created_at: '2026-06-29T08:00:00.000Z', updated_at: '2026-06-29T08:00:00.000Z' },
  ]

  for (const t of tickets) {
    insertTicket.run(t.title, t.description, t.status, t.priority, t.created_by, t.assigned_to, t.created_at, t.updated_at)
  }

  const insertComment = db.prepare(
    `INSERT INTO comments (ticket_id, author_id, content, created_at) VALUES (?, ?, ?, ?)`
  )

  insertComment.run(1, 1, 'Switch rebooted -- printer still unreachable. Escalated to network team for port investigation.', '2025-04-22T09:30:00.000Z')
  insertComment.run(2, 10, 'Rolled back AnyConnect to v4.9. Escalated to Cisco TAC for patch. Reference: TAC case #SR-2025-04117.', '2025-04-26T11:00:00.000Z')
  insertComment.run(3, 1, 'AD group membership verified -- user is in RH group. Suspecting GPO replication issue. Will force gpupdate.', '2025-05-07T14:00:00.000Z')
  insertComment.run(6, 10, 'Restarted SQL Server Express on srv-appli. Issue persists on 2 workstations. Reinstall scheduled for tomorrow.', '2025-05-21T10:10:00.000Z')
  insertComment.run(21, 1, 'AC unit 2 restarted remotely. Temperature back to 21°C at 05:45. Maintenance scheduled for next week.', '2025-07-15T06:00:00.000Z')
  insertComment.run(14, 10, 'Checked printer config -- Mac needs an IPP driver. Installed via CUPS. Testing with user tomorrow.', '2025-08-02T09:30:00.000Z')
}

module.exports = seed
