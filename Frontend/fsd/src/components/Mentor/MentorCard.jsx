import React from "react";
import { MapPin, Star, Calendar, ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import {
  Expandable,
  ExpandableCard,
  ExpandableContent,
  ExpandableTrigger,
  ExpandableCardHeader,
  ExpandableCardContent,
  ExpandableCardFooter,
} from "./Expandable"; // Ensure Expandable component is correctly imported
import DJANGO_BASE_URL from "../utils";

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
  return (
    <Expandable>
      <ExpandableCard className="bg-white shadow-lg rounded-lg overflow-hidden">
        <ExpandableCardHeader className="p-4 flex items-center space-x-4">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {mentor.profile_picture ? (
              <img
                src={`${DJANGO_BASE_URL}/media/${mentor.profile_picture}`}
                alt={mentor.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  {mentor.full_name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-900">
              {mentor.full_name}
            </h3>
            <span
              className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                getAvailabilityBadgeColor(mentor.availability_status)
              }`}
            >
              {mentor.availability_status}
            </span>
          </div>

          {/* Expand Trigger */}
          <ExpandableTrigger>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </motion.div>
          </ExpandableTrigger>
        </ExpandableCardHeader>

        <ExpandableContent preset="slide-down">
          <ExpandableCardContent className="p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span>{mentor.years_of_experience} years of experience</span>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>
                {[mentor.city, mentor.state, mentor.country]
                  .filter(Boolean)
                  .join(", ") || "Location unavailable"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>{mentor.availability_status}</span>
            </div>
          </ExpandableCardContent>

          <ExpandableCardFooter className="p-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewProfile(mentor.id)}
              className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              <span>View Full Profile</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </ExpandableCardFooter>
        </ExpandableContent>
      </ExpandableCard>
    </Expandable>
  );
};

export default MentorCard;
