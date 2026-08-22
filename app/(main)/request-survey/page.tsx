import RequestSurveySection from '@/components/ContactPage/RequestSurveySection';
import PageHeader from '@/components/pagesComps/PageHeader';
import React from 'react';

const page = () => {
    return (
        <div>
            <PageHeader
                breadcrumbs={[
                    { label: 'Home', link: '/' },
                    { label: 'Request Survey' }
                ]}
                imageUrl="/images/help/evchargers-2048px-4445-2x1-1.webp"
                title="Request a Free Site Survey or Consultation Call"
                description="Tell us about your site and charging needs — our engineering team will assess feasibility, recommend hardware, and follow up with a tailored proposal."
            />
            <RequestSurveySection/>
        </div>
    );
};

export default page;