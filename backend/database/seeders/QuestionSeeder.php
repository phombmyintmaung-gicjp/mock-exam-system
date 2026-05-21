<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            // ── AWS ──────────────────────────────────────────────────────────────
            [
                'text'        => 'Which AWS service provides a managed relational database that is compatible with MySQL and PostgreSQL?',
                'difficulty'  => 'easy',
                'category'    => 'AWS',
                'explanation' => 'Amazon Aurora is a managed relational database engine compatible with MySQL and PostgreSQL. It is part of the Amazon RDS family and offers up to 5× the throughput of MySQL.',
                'choices'     => [
                    ['text' => 'Amazon DynamoDB',   'is_correct' => false, 'order' => 0],
                    ['text' => 'Amazon Aurora',      'is_correct' => true,  'order' => 1],
                    ['text' => 'Amazon Redshift',    'is_correct' => false, 'order' => 2],
                    ['text' => 'Amazon ElastiCache', 'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'Which AWS service is best suited for hosting a static website with global low-latency delivery?',
                'difficulty'  => 'easy',
                'category'    => 'AWS',
                'explanation' => 'Amazon S3 can host static websites, but pairing it with Amazon CloudFront (a CDN) provides global low-latency delivery. CloudFront caches content at edge locations worldwide.',
                'choices'     => [
                    ['text' => 'Amazon EC2 behind an ALB',    'is_correct' => false, 'order' => 0],
                    ['text' => 'AWS Elastic Beanstalk',       'is_correct' => false, 'order' => 1],
                    ['text' => 'Amazon S3 + Amazon CloudFront','is_correct' => true,  'order' => 2],
                    ['text' => 'Amazon Lightsail',            'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'What is the primary purpose of AWS IAM roles when assigned to an EC2 instance?',
                'difficulty'  => 'medium',
                'category'    => 'AWS',
                'explanation' => 'IAM roles attached to EC2 instances provide temporary, automatically-rotated credentials via the instance metadata service. This allows the instance to call AWS APIs without embedding long-term access keys in code or configuration files.',
                'choices'     => [
                    ['text' => 'To encrypt the EBS volume attached to the instance',         'is_correct' => false, 'order' => 0],
                    ['text' => 'To provide temporary AWS API credentials without embedding keys', 'is_correct' => true, 'order' => 1],
                    ['text' => 'To restrict inbound network traffic to the instance',         'is_correct' => false, 'order' => 2],
                    ['text' => 'To enable SSH access from the AWS console',                  'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'A company needs to run a batch workload that can tolerate interruptions and requires the lowest possible cost. Which EC2 purchasing option should they choose?',
                'difficulty'  => 'medium',
                'category'    => 'AWS',
                'explanation' => 'Spot Instances use spare EC2 capacity and can be up to 90% cheaper than On-Demand pricing. They can be interrupted with a 2-minute notice, making them ideal for fault-tolerant batch jobs.',
                'choices'     => [
                    ['text' => 'On-Demand Instances',      'is_correct' => false, 'order' => 0],
                    ['text' => 'Reserved Instances (1-yr)', 'is_correct' => false, 'order' => 1],
                    ['text' => 'Spot Instances',           'is_correct' => true,  'order' => 2],
                    ['text' => 'Dedicated Hosts',          'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'Which AWS service would you use to decouple microservices using a fully managed message queue?',
                'difficulty'  => 'medium',
                'category'    => 'AWS',
                'explanation' => 'Amazon SQS (Simple Queue Service) is a fully managed message queuing service that decouples application components. It allows services to communicate asynchronously, improving resilience and scalability.',
                'choices'     => [
                    ['text' => 'Amazon SNS',     'is_correct' => false, 'order' => 0],
                    ['text' => 'Amazon Kinesis', 'is_correct' => false, 'order' => 1],
                    ['text' => 'Amazon SQS',     'is_correct' => true,  'order' => 2],
                    ['text' => 'AWS Step Functions', 'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'An application needs sub-millisecond read latency for a session store. Which AWS service is the best fit?',
                'difficulty'  => 'hard',
                'category'    => 'AWS',
                'explanation' => 'Amazon ElastiCache (with Redis or Memcached) is an in-memory caching service offering sub-millisecond latency. It is commonly used for session stores, leaderboards, and real-time analytics.',
                'choices'     => [
                    ['text' => 'Amazon RDS with read replicas',  'is_correct' => false, 'order' => 0],
                    ['text' => 'Amazon DynamoDB with DAX',       'is_correct' => false, 'order' => 1],
                    ['text' => 'Amazon ElastiCache for Redis',   'is_correct' => true,  'order' => 2],
                    ['text' => 'Amazon S3 with Transfer Acceleration', 'is_correct' => false, 'order' => 3],
                ],
            ],

            // ── Network ──────────────────────────────────────────────────────────
            [
                'text'        => 'Which layer of the OSI model does TCP operate at?',
                'difficulty'  => 'easy',
                'category'    => 'Network',
                'explanation' => 'TCP (Transmission Control Protocol) operates at Layer 4 (Transport layer) of the OSI model. It provides reliable, ordered, and error-checked delivery of a stream of data between applications.',
                'choices'     => [
                    ['text' => 'Layer 2 — Data Link',   'is_correct' => false, 'order' => 0],
                    ['text' => 'Layer 3 — Network',     'is_correct' => false, 'order' => 1],
                    ['text' => 'Layer 4 — Transport',   'is_correct' => true,  'order' => 2],
                    ['text' => 'Layer 7 — Application', 'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'What is the default subnet mask for a Class C IP address?',
                'difficulty'  => 'easy',
                'category'    => 'Network',
                'explanation' => 'Class C addresses (192.0.0.0–223.255.255.255) use a default subnet mask of 255.255.255.0 (/24), which provides 254 usable host addresses per network.',
                'choices'     => [
                    ['text' => '255.0.0.0',     'is_correct' => false, 'order' => 0],
                    ['text' => '255.255.0.0',   'is_correct' => false, 'order' => 1],
                    ['text' => '255.255.255.0', 'is_correct' => true,  'order' => 2],
                    ['text' => '255.255.255.128','is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'Which protocol is used to dynamically assign IP addresses to devices on a network?',
                'difficulty'  => 'easy',
                'category'    => 'Network',
                'explanation' => 'DHCP (Dynamic Host Configuration Protocol) automatically assigns IP addresses, subnet masks, gateways, and DNS servers to network devices, eliminating the need for manual configuration.',
                'choices'     => [
                    ['text' => 'DNS',  'is_correct' => false, 'order' => 0],
                    ['text' => 'DHCP', 'is_correct' => true,  'order' => 1],
                    ['text' => 'ARP',  'is_correct' => false, 'order' => 2],
                    ['text' => 'ICMP', 'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'What is the purpose of a VLAN?',
                'difficulty'  => 'medium',
                'category'    => 'Network',
                'explanation' => 'A VLAN (Virtual Local Area Network) segments a physical network into multiple logical networks at Layer 2. This improves security by isolating broadcast domains and allows administrators to group devices logically regardless of physical location.',
                'choices'     => [
                    ['text' => 'To encrypt traffic between two endpoints',                     'is_correct' => false, 'order' => 0],
                    ['text' => 'To segment a physical network into logical broadcast domains', 'is_correct' => true,  'order' => 1],
                    ['text' => 'To translate private IP addresses to public IP addresses',     'is_correct' => false, 'order' => 2],
                    ['text' => 'To balance traffic across multiple servers',                   'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'In BGP, what is the term for the path attribute that specifies the list of autonomous systems a route has passed through?',
                'difficulty'  => 'hard',
                'category'    => 'Network',
                'explanation' => 'The AS_PATH attribute is a well-known mandatory BGP attribute that records the sequence of Autonomous System numbers a route has traversed. It is used for loop prevention and as one of the primary factors in BGP path selection.',
                'choices'     => [
                    ['text' => 'NEXT_HOP',   'is_correct' => false, 'order' => 0],
                    ['text' => 'LOCAL_PREF', 'is_correct' => false, 'order' => 1],
                    ['text' => 'AS_PATH',    'is_correct' => true,  'order' => 2],
                    ['text' => 'MED',        'is_correct' => false, 'order' => 3],
                ],
            ],

            // ── Security ─────────────────────────────────────────────────────────
            [
                'text'        => 'Which attack type involves sending more data to a buffer than it can hold, potentially allowing arbitrary code execution?',
                'difficulty'  => 'easy',
                'category'    => 'Security',
                'explanation' => 'A buffer overflow attack writes data beyond the allocated memory buffer boundary. An attacker can overwrite adjacent memory, including return addresses, to redirect execution to malicious code.',
                'choices'     => [
                    ['text' => 'SQL Injection',   'is_correct' => false, 'order' => 0],
                    ['text' => 'Buffer Overflow', 'is_correct' => true,  'order' => 1],
                    ['text' => 'Cross-Site Scripting (XSS)', 'is_correct' => false, 'order' => 2],
                    ['text' => 'Man-in-the-Middle',          'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'What does the principle of "least privilege" mean in information security?',
                'difficulty'  => 'easy',
                'category'    => 'Security',
                'explanation' => 'The principle of least privilege states that users, processes, and systems should be granted only the minimum permissions necessary to perform their required functions. This limits the damage that can be caused by accidents, errors, or security breaches.',
                'choices'     => [
                    ['text' => 'Every user must use the same shared password',                        'is_correct' => false, 'order' => 0],
                    ['text' => 'Users should only have the permissions necessary for their job role', 'is_correct' => true,  'order' => 1],
                    ['text' => 'Admins should have unlimited access to all systems',                  'is_correct' => false, 'order' => 2],
                    ['text' => 'All data should be encrypted at rest',                               'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'Which symmetric encryption algorithm uses a 256-bit key and is considered the current gold standard for data encryption?',
                'difficulty'  => 'medium',
                'category'    => 'Security',
                'explanation' => 'AES-256 (Advanced Encryption Standard with a 256-bit key) is widely considered the gold standard for symmetric encryption. It is approved by NIST and used in TLS, disk encryption, and many government/military applications.',
                'choices'     => [
                    ['text' => 'DES',     'is_correct' => false, 'order' => 0],
                    ['text' => '3DES',    'is_correct' => false, 'order' => 1],
                    ['text' => 'AES-256', 'is_correct' => true,  'order' => 2],
                    ['text' => 'RC4',     'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'What type of attack involves an attacker intercepting and potentially altering communication between two parties without their knowledge?',
                'difficulty'  => 'medium',
                'category'    => 'Security',
                'explanation' => 'A Man-in-the-Middle (MitM) attack occurs when an attacker secretly intercepts and relays messages between two parties who believe they are communicating directly. TLS/SSL and certificate pinning are common defenses.',
                'choices'     => [
                    ['text' => 'Phishing',            'is_correct' => false, 'order' => 0],
                    ['text' => 'Man-in-the-Middle',   'is_correct' => true,  'order' => 1],
                    ['text' => 'Denial of Service',   'is_correct' => false, 'order' => 2],
                    ['text' => 'Privilege Escalation','is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'In a PKI (Public Key Infrastructure), what is the role of a Certificate Authority (CA)?',
                'difficulty'  => 'hard',
                'category'    => 'Security',
                'explanation' => 'A Certificate Authority (CA) is a trusted entity that issues digital certificates. These certificates bind a public key to an identity (person, organization, or domain). Browsers and operating systems maintain a list of trusted root CAs to establish chains of trust for TLS connections.',
                'choices'     => [
                    ['text' => 'To encrypt all network traffic between clients and servers',                          'is_correct' => false, 'order' => 0],
                    ['text' => 'To issue and sign digital certificates that bind public keys to verified identities', 'is_correct' => true,  'order' => 1],
                    ['text' => 'To store private keys on behalf of users',                                           'is_correct' => false, 'order' => 2],
                    ['text' => 'To manage firewall rules for inbound HTTPS traffic',                                  'is_correct' => false, 'order' => 3],
                ],
            ],

            // ── Linux ─────────────────────────────────────────────────────────────
            [
                'text'        => 'Which command displays the current disk usage of all mounted filesystems in human-readable format?',
                'difficulty'  => 'easy',
                'category'    => 'Linux',
                'explanation' => '`df -h` reports disk space usage for all mounted filesystems. The `-h` flag formats sizes in human-readable units (KB, MB, GB). Use `du -sh` to check usage for a specific directory.',
                'choices'     => [
                    ['text' => 'ls -lh',  'is_correct' => false, 'order' => 0],
                    ['text' => 'du -sh',  'is_correct' => false, 'order' => 1],
                    ['text' => 'df -h',   'is_correct' => true,  'order' => 2],
                    ['text' => 'fdisk -l','is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'What does the chmod command `chmod 755 script.sh` set as the file permissions?',
                'difficulty'  => 'medium',
                'category'    => 'Linux',
                'explanation' => 'chmod 755 sets: owner = read+write+execute (7), group = read+execute (5), others = read+execute (5). This is a common permission for executable scripts — owner can modify, everyone can execute.',
                'choices'     => [
                    ['text' => 'Owner: rwx, Group: rwx, Others: rwx', 'is_correct' => false, 'order' => 0],
                    ['text' => 'Owner: rwx, Group: r-x, Others: r-x', 'is_correct' => true,  'order' => 1],
                    ['text' => 'Owner: rw-, Group: r--, Others: r--', 'is_correct' => false, 'order' => 2],
                    ['text' => 'Owner: rwx, Group: ---, Others: ---', 'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'Which Linux command shows real-time resource usage (CPU, memory, processes) in an interactive view?',
                'difficulty'  => 'easy',
                'category'    => 'Linux',
                'explanation' => '`top` provides a real-time, interactive view of running processes and system resource usage including CPU and memory. `htop` is a more feature-rich alternative. `ps` shows a static snapshot of processes.',
                'choices'     => [
                    ['text' => 'ps aux',  'is_correct' => false, 'order' => 0],
                    ['text' => 'vmstat',  'is_correct' => false, 'order' => 1],
                    ['text' => 'top',     'is_correct' => true,  'order' => 2],
                    ['text' => 'netstat', 'is_correct' => false, 'order' => 3],
                ],
            ],
            [
                'text'        => 'A process with PID 1234 is unresponsive and `kill 1234` has no effect. What command forcefully terminates it?',
                'difficulty'  => 'medium',
                'category'    => 'Linux',
                'explanation' => '`kill -9 PID` sends SIGKILL, which cannot be caught or ignored by the process. Unlike SIGTERM (the default), SIGKILL forces the kernel to immediately terminate the process.',
                'choices'     => [
                    ['text' => 'kill -1 1234',  'is_correct' => false, 'order' => 0],
                    ['text' => 'kill -9 1234',  'is_correct' => true,  'order' => 1],
                    ['text' => 'kill -15 1234', 'is_correct' => false, 'order' => 2],
                    ['text' => 'stop 1234',     'is_correct' => false, 'order' => 3],
                ],
            ],
        ];

        foreach ($questions as $qData) {
            $choicesData = $qData['choices'];
            unset($qData['choices']);

            $questionId = DB::table('questions')->insertGetId(array_merge($qData, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            foreach ($choicesData as $choice) {
                DB::table('choices')->insert(array_merge($choice, ['question_id' => $questionId]));
            }
        }
    }
}
