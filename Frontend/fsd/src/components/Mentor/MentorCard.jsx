import React, { useState } from "react";
import { 
  MapPin, Star, Calendar, ArrowRight, Briefcase, 
  MessageSquare, Coffee, UserCheck 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { 
  Expandable, 
  ExpandableCard, 
  ExpandableCardContent, 
  ExpandableCardHeader, 
  ExpandableContent,
  ExpandableTrigger 
} from "@/components/ui/expandable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

import DJANGO_BASE_URL from "../../lib/utils";
const getAvailabilityBadgeColor = (status) => {
  switch (status.toLowerCase()) {
    case "available":
      return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
        default:
          return "bg-gray-100 text-gray-800";
        }
      };
      
const MentorCard = ({ mentor, onViewProfile }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <Expandable 
      expandDirection="both" 
      expandBehavior="replace"
    >
      <ExpandableTrigger>
        <ExpandableCard
          className="w-full relative"
          collapsedSize={{ width: 320, height: 420 }}
          expandedSize={{ width: 420, height: 620 }}
          hoverToExpand={false}
          expandDelay={200}
          collapseDelay={300}
        >
          <ExpandableCardHeader>
            <motion.div 
              className="flex flex-col items-center"
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.43, 0.13, 0.23, 0.96] }}
            >
              {/* Profile Picture */}
              <div className="relative mb-4">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={mentor.profile_picture 
                      ? `${DJANGO_BASE_URL}/media/${mentor.profile_picture}` 
                      : undefined
                    } 
                    alt={mentor.full_name}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-3xl">
                    {mentor.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Availability Status */}
              <Badge 
                variant="secondary" 
                className={`${getAvailabilityBadgeColor(mentor.availability_status)} mb-2`}
              >
                {mentor.availability_status}
              </Badge>

              {/* Mentor Name */}
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {mentor.full_name}
              </h3>

              {/* Mentor Type and Department */}
              <p className="text-gray-600 font-medium">
                {mentor.mentor_type} {mentor.department && `· ${mentor.department}`}
              </p>
            </motion.div>
          </ExpandableCardHeader>

          <ExpandableCardContent>
            <div className="space-y-4 text-sm">
              {/* Basic Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>{mentor.years_of_experience} years</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {[mentor.city, mentor.state, mentor.country]
                      .filter(Boolean)
                      .join(", ") || "Location unavailable"}
                  </span>
                </div>
              </div>

              {/* Expanded Content */}
              <ExpandableContent 
                preset="fade" 
                stagger 
                staggerChildren={0.1}
              >
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                    <span>Expertise: {mentor.mentor_type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <UserCheck className="w-5 h-5 text-green-500" />
                    <span>Preferred Mentorship: {mentor.availability_status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Coffee className="w-5 h-5 text-orange-500" />
                    <span>Consultation Style: Collaborative</span>
                  </div>
                </div>
              </ExpandableContent>
            </div>
          </ExpandableCardContent>

          {/* Footer */}
          <ExpandableContent preset="slide-up">
            <div className="mt-4 space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigate(`/mentor/${mentor.id}`)}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                View Full Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Request Consultation
              </Button>
            </div>
          </ExpandableContent>
        </ExpandableCard>
      </ExpandableTrigger>
    </Expandable>
  );
};

export default MentorCard;