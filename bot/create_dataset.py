import json
import pandas as pd
import os

qa_pairs = [
    # --- About the Company (Goal: >= 10) ---
    {"question": "What is ProcUrPal?", "answer": "ProcUrPal is an AI-powered ProcureTech startup revolutionizing the Procurement SaaS market."},
    {"question": "Who founded ProcUrPal?", "answer": "ProcUrPal was founded by Vikas Chadda."},
    {"question": "What is the background of Vikas Chadda, the founder?", "answer": "Vikas Chadda is an industry veteran with over 25 years of experience in IT infrastructure, handling large RFPs, government procurement, and SaaS."},
    {"question": "How is ProcUrPal officially recognized?", "answer": "ProcUrPal is recognized as a startup by the DPIIT (Department for Promotion of Industry and Internal Trade)."},
    {"question": "What certification does ProcUrPal hold regarding security?", "answer": "ProcUrPal holds the ISO 27001 certification, demonstrating commitment to information security and governance."},
    {"question": "What award did ProcUrPal win from Business Connect Magazine in 2024?", "answer": "ProcUrPal received the 'Innovative Leaders of The Year 2024 Award' from Business Connect Magazine."},
    {"question": "What recognition did ProcUrPal receive at the India AI Summit 2024?", "answer": "ProcUrPal was awarded the 'Best Use of AI in Procurement & SaaS' at the India AI Summit 2024."},
    {"question": "What is ProcUrPal's mission?", "answer": "To revolutionize procurement by providing innovative, AI-powered solutions that streamline processes, optimize supplier relationships, and drive tangible value for businesses worldwide."},
    {"question": "What is the main focus of ProcUrPal's mission?", "answer": "The mission is to revolutionize the procurement landscape through AI-powered solutions."},
    {"question": "Does ProcUrPal operate only in India?", "answer": "No, ProcUrPal empowers businesses in India and worldwide."},
    {"question": "Is ProcUrPal a SaaS company?", "answer": "Yes, ProcUrPal is redefining and revolutionizing the Procurement SaaS market."},


    # --- Services (Goal: >= 10) ---
    {"question": "What are the main solutions offered by ProcUrPal?", "answer": "ProcUrPal offers the RFx Module, eAuction Module, Tail Spend Management, and Consulting Services."},
    {"question": "Tell me about the RFx module.", "answer": "ProcUrPal's RFx module automates and simplifies RFIs, RFPs, and RFQs."},
    {"question": "What kind of events does the RFx module streamline?", "answer": "The RFx module streamlines sourcing events like RFIs, RFPs, and RFQs."},
    {"question": "Does the RFx module support AI scoring?", "answer": "Yes, the RFx module includes AI-enabled scoring."},
    {"question": "Can I use templates in the RFx module?", "answer": "Yes, the RFx module offers standardized templates and comprehensive question libraries."},
    {"question": "Does the RFx module have automated workflows?", "answer": "Yes, the RFx module includes automated workflows."},
    {"question": "How much time can the RFx module save?", "answer": "The RFx process can be sped up by over 50% using the RFx module."},
    {"question": "What is the eAuction module used for?", "answer": "The eAuction module is used to drive significant savings and optimize supplier selection through real-time negotiations."},
    {"question": "What auction types are supported by the eAuction module?", "answer": "Supported e-auction types include Reverse Auction (rank based), Forward Auction, Dutch Auction, and English Auction."},
    {"question": "What features are available in the eAuction module?", "answer": "Features include supplier recommendations, AI Bot Support, automated alerts, and supplier bids side-by-side comparison."},
    {"question": "What kind of savings can I expect from the eAuction module?", "answer": "You can derive at least 20% overall savings on your project budget with the eAuction module."},
    {"question": "Explain Tail Spend Management.", "answer": "Tail spend management helps control frequent, low-value purchases that often go unmanaged."},
    {"question": "Why is it important to manage tail spend?", "answer": "Untracked tail spend can cause inefficiencies like duplicate buying, inefficient supplier management, missed discounts, and compliance risks."},
    {"question": "What percentage of indirect expenses is typically tail spend?", "answer": "Tail spend can make up over 10% of indirect expenses."},
    {"question": "How does ProcUrPal help control tail spend?", "answer": "ProcUrPal helps control tail spend using automation tools for better visibility, among other methods."},
    {"question": "What are ProcUrPal's Consulting Services?", "answer": "Consulting Services include automating procurement, enhancing supplier collaboration, cutting costs, and implementing strategic procurement practices."},
    {"question": "How much can Consulting Services reduce SG&A costs?", "answer": "Consulting Services can cut SG&A costs by up to 20% using AI and RPA."},
    {"question": "What kind of savings do digital procurement solutions drive through Consulting?", "answer": "Digital procurement solutions drive 30-40% savings through P2P automation and AI-driven category management."},


    # --- Unique Selling Points (Goal: >= 10) ---
    {"question": "What makes ProcUrPal unique?", "answer": "ProcUrPal simplifies and streamlines the procurement process with several key USPs."},
    {"question": "What are the key benefits of the ProcUrPal platform?", "answer": "Key benefits include an End-to-End Procurement Suite, AI-Powered Analytics, a User-Friendly Interface, Cost-Effectiveness, and Scalability."},
    {"question": "Does ProcUrPal cover the entire procurement process?", "answer": "Yes, the End-to-End Procurement Suite covers all stages from sourcing to contract management and supplier performance."},
    {"question": "How does ProcUrPal leverage AI?", "answer": "ProcUrPal utilizes AI-Powered Analytics to optimize procurement decisions and identify cost-saving opportunities."},
    {"question": "Is the ProcUrPal interface easy for procurement professionals?", "answer": "Yes, it is designed with a User-Friendly Interface for efficient navigation."},
    {"question": "Is ProcUrPal affordable for businesses?", "answer": "Yes, it is Cost-Effective, offering affordable pricing plans for businesses of all sizes."},
    {"question": "Can I access ProcUrPal from anywhere?", "answer": "Yes, as a Cloud-Based Solution, it provides flexibility and accessibility from anywhere, anytime."},
    {"question": "Does ProcUrPal allow customization for specific needs?", "answer": "Yes, the platform allows for Customization to adapt to specific business requirements."},
    {"question": "How does the platform improve working with suppliers?", "answer": "It facilitates better Supplier Collaboration, improving transparency and efficiency."},
    {"question": "Can I see procurement data in real-time?", "answer": "Yes, ProcUrPal provides Real-Time Analytics and reporting capabilities."},
    {"question": "Does ProcUrPal help manage compliance?", "answer": "Yes, it helps organizations maintain Compliance Management with procurement regulations and policies."},
    {"question": "Can ProcUrPal connect with my existing systems?", "answer": "Yes, it offers seamless Integration Capabilities with existing ERP systems."},
    {"question": "Is ProcUrPal suitable for large businesses with complex needs?", "answer": "Yes, it is built for Scalability, accommodating the complexities of large enterprises and multi-site operations."},
    {"question": "Does ProcUrPal offer visibility into procurement?", "answer": "Yes, ProcUrPal ensures real-time visibility into procurement processes for Transparency."},

    # --- Pricing Models (Goal: >= 10) ---
    {"question": "What pricing models does ProcUrPal offer?", "answer": "ProcUrPal offers three main pricing models: Subscription Model, Event-Based Pricing, and Spend-Based Pricing."},
    {"question": "Which pricing model is recommended for large enterprises needing full automation?", "answer": "The Subscription Model is recommended for Enterprises looking for end-to-end procurement automation."},
    {"question": "What type of plans are available with the Subscription Model?", "answer": "The Subscription Model offers Fixed Quarterly or annual plans."},
    {"question": "What features are included in the Subscription Model?", "answer": "Features include AI-driven insights, RFQs, eAuctions, and supplier management."},
    {"question": "Who is Event-Based Pricing suitable for?", "answer": "Event-Based Pricing is suitable for Small and Mid-Sized companies & Project-Based Buyers needing flexibility."},
    {"question": "How does Event-Based Pricing work?", "answer": "With Event-Based Pricing, you pay only the deployment cost and pay only for what you use as per the events slab."},
    {"question": "When is Event-Based Pricing ideal?", "answer": "It's perfect for one-time procurement events or seasonal purchasing."},
    {"question": "Which pricing model is best for large companies with high procurement volume?", "answer": "Spend-Based Pricing is best for Large Enterprises handling high-value procurement."},
    {"question": "How is the fee calculated in the Spend-Based Pricing model?", "answer": "It is a Transparent percentage-based fee on total procurement spend."},
    {"question": "Does the Spend-Based fee change?", "answer": "The fee scales with your business – offering higher savings as volume grows."},
    {"question": "How can I find out which pricing model is right for me?", "answer": "ProcUrPal offers a pricing model that aligns with your procurement strategy; you can Contact Us to discuss options."},
    {"question": "Can I get a quote for ProcUrPal pricing?", "answer": "Yes, you need to Contact Us to get specific pricing details based on your needs."},


    # --- Savings (Implicit zone from "Procurement That Pays for Itself") ---
    {"question": "How much can using ProcUrPal reduce procurement costs?", "answer": "You can reduce procurement costs by up to 20% with smarter sourcing."},
    {"question": "How quickly can ProcUrPal help with supplier negotiations?", "answer": "ProcUrPal can cut supplier negotiation time by 50% with AI-driven insights."},
    {"question": "Does ProcUrPal help ensure compliance?", "answer": "Yes, ProcUrPal helps ensure 100% compliance & transparency with automated workflows."},

    # --- Contact Info (Goal: >= 10) ---
    {"question": "How can I contact ProcUrPal?", "answer": "You can contact ProcUrPal via phone or email, or find their address."},
    {"question": "What is the main phone number for ProcUrPal?", "answer": "The phone number is +91 91634 00786."},
    {"question": "What is the main email address for ProcUrPal inquiries?", "answer": "The email address is vikas@procurpal.in."},
    {"question": "What is the physical address of ProcUrPal Private Limited?", "answer": "The address is ProUrPal Private Limited, Obeya Verve, L376 / A, 14th B Cross Rd, Sector 6, HSR Layout, Bengaluru, Karnataka 560102, India."},
    {"question": "In which city is ProcUrPal located?", "answer": "ProcUrPal is located in Bengaluru."},
    {"question": "In which state is ProcUrPal located?", "answer": "ProcUrPal is located in Karnataka."},
    {"question": "What is the pincode for the ProcUrPal address?", "answer": "The pincode is 560102."},
    {"question": "What road is the ProcUrPal office on?", "answer": "The office is on 14th B Cross Rd, Sector 6, HSR Layout."},
    {"question": "Does ProcUrPal have a presence on social media?", "answer": "Yes, ProcUrPal is present on social media."},
    {"question": "Where can I find ProcUrPal on social media?", "answer": "You can find ProcUrPal on LinkedIn (ProcUrPal, Vikas Chadda) and YouTube (@procurpal.in)."},
    {"question": "Can I send an email to ProcUrPal?", "answer": "Yes, you can send an email to vikas@procurpal.in."},
    {"question": "How can I get in touch with ProcUrPal sales?", "answer": "You can use the provided phone number or email address, or the 'Contact Us' option on the website to get in touch with ProcUrPal."}, # Rephrased contact
    {"question": "How can I reach ProcUrPal support?", "answer": "You can use the provided phone number (+91 91634 00786) or email address (vikas@procurpal.in) for assistance."}, # Rephrased contact

    # --- Purchase Order-related (Based on common procurement tasks & P2P mention) (Goal: >= 10) ---
    {"question": "How do I create a purchase order in ProcUrPal?", "answer": "You can create a purchase order through the ProcUrPal platform using its sourcing and procurement tools, integrated into the P2P process."},
    {"question": "Can I track the status of purchase orders in ProcUrPal?", "answer": "Yes, the platform provides real-time tracking and analytics for all procurement activities including purchase orders."},
    {"question": "Does ProcUrPal offer purchase order approval workflows?", "answer": "Yes, ProcUrPal supports customizable automated workflows including PO approval processes."},
    {"question": "Can I generate reports specifically for purchase orders?", "answer": "Yes, ProcUrPal offers reporting and analytics tools for tracking and auditing purchase orders."},
    {"question": "Does ProcUrPal manage the process from requisition to payment?", "answer": "Yes, digital procurement solutions drive savings through P2P automation, which covers the process from requisition to payment."},
    {"question": "Is goods receipt handled within ProcUrPal related to POs?", "answer": "Yes, as part of P2P automation, steps like goods receipt related to purchase orders are managed within the platform."}, # Inference based on P2P
    {"question": "Does ProcUrPal help with matching invoices to purchase orders?", "answer": "Yes, P2P automation typically includes invoice processing and matching against purchase orders."}, # Inference based on P2P
    {"question": "Can ProcUrPal integrate with my accounting system for POs?", "answer": "Yes, ProcUrPal offers seamless ERP integration which can include connecting with accounting systems for managing purchase orders and payments."}, # Inference based on ERP & P2P
    {"question": "How are purchase order workflows automated?", "answer": "ProcUrPal supports customizable automated workflows, allowing you to automate steps like purchase order generation and approval."}, # Refine existing
    {"question": "Can the RFx module lead to generating a purchase order?", "answer": "While the RFx module focuses on sourcing, the platform's integration and P2P capabilities can facilitate purchase order creation after supplier selection."}, # Connecting modules
    {"question": "Does tail spend management involve using purchase orders?", "answer": "Yes, tail spend management involves controlling frequent purchases which are typically managed and tracked through the platform's tools and integrated P2P processes, including POs."}, # Connecting modules
    {"question": "Can I track budgets against purchase orders in ProcUrPal?", "answer": "Yes, the platform's real-time analytics and transparency features allow you to track budget consumption related to procurement activities like purchase orders."}, # Inference from analytics/transparency


    # --- Generic AI Bot Questions & Platform Use (Goal: >= 10) ---
    {"question": "What can you help me with?", "answer": "I can assist with questions about ProcUrPal, its services, modules, pricing, and procurement best practices mentioned on the website."},
    {"question": "How secure is ProcUrPal?", "answer": "ProcUrPal is ISO 27001 certified, ensuring high standards of information security and governance."},
    {"question": "Is ProcUrPal suitable for small businesses?", "answer": "Yes, ProcUrPal offers scalable and flexible pricing suitable for businesses of all sizes, including SMBs and project-based buyers, particularly with the Event-Based pricing."},
    {"question": "Can ProcUrPal integrate with ERP systems?", "answer": "Yes, ProcUrPal seamlessly integrates with major ERP systems to automate procurement processes."},
    {"question": "How can I get a demonstration of the ProcUrPal platform?", "answer": "You can likely click the 'Get Started' button on the website or Contact Us to arrange a demonstration."},
    {"question": "Where can I find more information or resources about ProcUrPal?", "answer": "You can find Resources like Blogs, Case Studies, and In Media on the ProcUrPal website."},
    {"question": "What kind of customer support is available?", "answer": "You can contact ProcUrPal via the provided phone number or email address for support and assistance."},
     {"question": "How does ProcUrPal contribute to digital transformation?", "answer": "ProcUrPal helps organizations achieve their digital transformation goals through cutting-edge SAAS platform that streamlines processes."},
    {"question": "Is ProcUrPal suitable for global operations?", "answer": "Yes, the platform is designed to empower businesses worldwide and is built to scale with multi-site operations."},
    {"question": "Can I partner with ProcUrPal?", "answer": "Yes, there is a 'Partner With Us' option mentioned on the website."},
    {"question": "How can I become a ProcUrPal partner?", "answer": "You can find information or contact them via the 'Partner With Us' link/page on the website."},
    {"question": "Does ProcUrPal help with ESG compliance?", "answer": "Yes, Consulting Services include ESG-compliant strategies to build resilient supply chains."},
    {"question": "What is zero-based budgeting in the context of ProcUrPal?", "answer": "ProcUrPal helps unlock hidden efficiencies through zero-based budgeting as part of its Consulting Services."},
    {"question": "What is value chain analysis in the context of ProcUrPal?", "answer": "ProcUrPal assists with value chain analysis as part of its Consulting Services to unlock hidden efficiencies."}

]

df = pd.DataFrame(qa_pairs)

# Save the CSV inside server/data
csv_path = "../server/data/procurpal_nlp_dataset.csv"
os.makedirs(os.path.dirname(csv_path), exist_ok=True)

df.to_csv(csv_path, index=False)
print(f"Dataset saved to {csv_path}")
