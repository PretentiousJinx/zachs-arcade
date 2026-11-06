export type Job = {
    title: string;
    company: string;
    location: string;
    dates: string;
    highlights: string[];
};

export type SkillGroup = {
    category: string;
    items: string;
};

export type Project = {
    name: string;
    tech: string;
    description: string;
};

export const HEADLINE = 'Systems & Infrastructure Engineer | CISSP | Active TS/SCI';

export const SUMMARY =
    'Systems engineer with ~8 years of experience automating and scaling Windows, cloud, and virtualization infrastructure for federal enterprises (FBI, Joint Staff), including endpoint management across a 150,000-device fleet and an enterprise vSphere 7-to-8 data center upgrade. Builds production automation in PowerShell, C#, and Python and contributes to full-stack Angular/.NET applications.';

export const SKILLS: SkillGroup[] = [
    {
        category: 'Languages',
        items: 'C#, Python, PowerShell, TypeScript, JavaScript, SQL, C/C++',
    },
    {
        category: 'Web & Backend',
        items: 'Angular, React, .NET / OWIN (Katana), REST APIs, SQL Server 2019/2022, PostgreSQL, MongoDB',
    },
    {
        category: 'Cloud & Virtualization',
        items: 'AWS (S3, EC2), Azure, Hyper-V, VMware vSphere 7/8, Horizon 7/8 (Connection Server)',
    },
    {
        category: 'Endpoint & Automation',
        items: 'MECM/SCCM, HCL BigFix, WSUS, Ansible, DISM, Group Policy, Active Directory, GitLab, Windows Server 2008–2025, RHEL 8',
    },
    {
        category: 'Security',
        items: 'STIG hardening, ACAS/Nessus, PKI/SSL lifecycle, privileged account management, cross-domain solutions',
    },
];

export const JOBS: Job[] = [
    {
        title: 'Senior Systems Engineer II (Tier 4, Windows Infrastructure)',
        company: 'Open Systems Technology, supporting the FBI',
        location: 'Pocatello, ID',
        dates: 'Mar 2024 – Present',
        highlights: [
            'Led the enterprise-wide in-place upgrade from Windows 11 23H2 to 25H2 across ~150,000 endpoints with minimal user disruption, by designing phased MECM deployment rings, automated pre-flight checks, and rollback paths.',
            'Automated the end-to-end Windows image-servicing pipeline for the FBI secure baseline deployed to 150,000 endpoints, cutting build time from multiple days to one hour, by scripting offline servicing (DISM, cumulative updates, drivers, hardening) in PowerShell.',
            'Engineered an enterprise troubleshooting feature for a full-stack web application (Angular, C#/.NET, Katana self-hosted, GitLab), reducing mean time to resolution by 45% for 150,000 users, by building integrated diagnostic and remediation tooling.',
            'Orchestrated patching and compliance across a 150,000-endpoint fleet with MECM and HCL BigFix, raising patch compliance to 90% within 3 days of release by automating deployment, reporting, and remediation workflows.',
            'Re-architected the cross-domain transfer process on AWS, eliminating 40+ hours/month of manual work and disposable-media waste, by replacing physical-media workflows with automated pipelines.',
            'Automated password rotation for 7 privileged service accounts, removing 60 hours/month of manual effort and reducing errors, by building PowerShell workflows integrated with Active Directory.',
            'Built Hyper-V deployment automation (MECM and SQL Server prerequisites), cutting provisioning from 7 days to 3–4 hours; migrated 8+ databases from SQL Server 2019 to 2022 and implemented gMSAs to eliminate static credentials.',
        ],
    },
    {
        title: 'Systems Engineer II',
        company: 'Leidos, supporting the Joint Staff',
        location: 'Hampton Roads, VA',
        dates: 'Aug 2022 – Feb 2024',
        highlights: [
            'Led the enterprise-wide upgrade from VMware vSphere 7 to vSphere 8 across 48+ Dell PowerEdge ESXi hosts by planning phased host upgrades, vCenter migration, and hardware/driver compatibility validation.',
            'Owned end-to-end data center operations for the Joint Staff, spanning compute, SAN switch fabric, and Dell PowerStore storage, including storage migrations to PowerStore.',
            'Administered and upgraded (Horizon 7 to 8) two load-balanced VMware Horizon Connection Servers delivering VDI to the entire Joint Staff across Hampton Roads and the Pentagon, maintaining high availability through patching and incident response.',
            'Automated SSL certificate lifecycle management in PowerShell, reducing manual renewal effort and preventing expiry-related outages.',
            'Led the disaster-recovery appliance migration from Windows Server 2016 to 2019 with zero data loss, and performed STIG hardening and vulnerability remediation.',
        ],
    },
    {
        title: 'System Administrator',
        company: 'WR Systems',
        location: 'Little Creek–Fort Story, VA',
        dates: 'Nov 2020 – Aug 2022',
        highlights: [
            'Secured third-party collaborator assets through ACAS/Nessus scanning and remediation; administered backup and recovery for Windows/Linux users and an Autodesk Vault server, and supported full-site network operations.',
        ],
    },
];

export const PROJECTS: Project[] = [
    {
        name: 'Delivery Route Optimizer',
        tech: 'Python, custom hash table, nearest neighbor + 2-opt',
        description:
            'Cut fleet mileage 14% (110.2 to 94.7 mi) for a 3-truck, 40-package routing problem using deadline-validated 2-opt optimization and a from-scratch, self-resizing hash table.',
    },
    {
        name: 'Health Risk Forecaster',
        tech: 'Python, scikit-learn, pandas',
        description:
            'Reduced prediction error 41% vs. a decision-tree baseline (R² 0.978, 98% recall on high-risk days) by tuning Random Forest and Gradient Boosting ensembles with grid/randomized search and 5-fold cross-validation.',
    },
    {
        name: 'Portfolio Website',
        tech: 'React, Vercel, Resend, Cloudflare Turnstile',
        description:
            'Designed and deployed a responsive personal site with a serverless contact form and bot verification.',
    },
];

export const EDUCATION: string[] = [
    'B.S., Computer Science, Western Governors University, 2026',
    'CISSP, 2026',
    'CompTIA Security+ CE',
    'Active TS/SCI',
];