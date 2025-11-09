import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type React from "react";

export type BadgeType = 'lang' | 'concept' | 'skill' | 'topic'

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }



export const LangBadge = ({children, ...props}: BadgeProps) => {
    return <Badge {...props} className="bg-green-500 text-white hover:bg-green-600">{children}</Badge>
}

export const ConceptBadge = ({children, ...props}: BadgeProps) => {
    return <Badge {...props} className="bg-red-500 text-white hover:bg-red-600">{children}</Badge>
}

export const SkillBadge = (props: BadgeProps) => {
    return <Badge {...props} className="bg-blue-500 text-white hover:bg-blue-600"/>
}

export const TopicBadge = (props: BadgeProps) => {
    return <Badge {...props} className="bg-gray-500 text-white hover:bg-gray-600"/>
}

export function convertToBadgeType(tagKey: string): BadgeType {
    switch(tagKey) {
        case 'languages':
            return 'lang';
        case 'skills':
            return 'skill';
        case 'topics':
            return 'topic';
        case 'concepts':
            return 'concept';
        default:
            throw TypeError
    }
}

export function getBadgeConstructor(badgeType: BadgeType) {
    switch(badgeType) {
        case 'lang':
            return LangBadge
        case 'concept':
            return ConceptBadge
        case 'skill':
            return SkillBadge
        case 'topic':
            return TopicBadge
        default:
            throw TypeError(`Invalid badge type: '${badgeType}'`)
    }
}