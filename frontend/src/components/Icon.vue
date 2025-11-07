<template>
  <component
    :is="icon"
    :size="size"
    :color="color"
    :stroke-width="strokeWidth"
    :default-class="defaultClass"
  />
</template>

<script lang="ts">
import { Component, defineComponent, PropType } from "vue";
import {
  ChevronDown,
  X,
  HelpCircle,
  Sun,
  LayoutDashboard,
  Calendar,
  Users,
  UsersRound,
  Home,
  Bed,
  FolderOpen,
  ChevronRight,
  AlertTriangle,
  Boxes,
  Settings,
  MapPin,
  Award,
  CheckCircle,
  AlertCircle,
  Info,
  Package,
  FileText,
  Clock,
  Edit2,
  Trash2,
  CalendarDays,
  Plus,
  ListPlus,
  TreesIcon,
  Activity,
  Waves,
  MoreHorizontal,
  Palette,
  Tag,
  Map,
  Menu,
  Target,
  Dumbbell,
  Utensils,
  BookOpen,
  Search,
  Shield,
  Timer,
  LogOut,
  ListChecks,
} from "lucide-vue-next";

export type IconName = keyof typeof icons;

const icons: Record<string, Component> = {
  ChevronDown,
  X,
  HelpCircle,
  Sun,
  LayoutDashboard,
  Calendar,
  Users,
  UsersRound,
  Home,
  Bed,
  FolderOpen,
  ChevronRight,
  AlertTriangle,
  Boxes,
  Settings,
  MapPin,
  Award,
  CheckCircle,
  AlertCircle,
  Info,
  Package,
  FileText,
  Clock,
  Edit2,
  Trash2,
  CalendarDays,
  Plus,
  ListPlus,
  Trees: TreesIcon,
  Activity,
  Waves,
  MoreHorizontal,
  Palette,
  Tag,
  Map,
  Menu,
  Target,
  Dumbbell,
  Utensils,
  BookOpen,
  Search,
  Shield,
  Timer,
  LogOut,
  ListChecks,
} as const;

export default defineComponent({
  name: "Icon",
  props: {
    name: {
      type: String as PropType<IconName>,
      required: true,
    },
    size: {
      type: Number,
      required: false,
    },
    color: {
      type: String,
      required: false,
      default: "currentColor",
    },
    strokeWidth: {
      type: Number,
      required: false,
    },
    defaultClass: {
      type: String,
      required: false,
    },
  },
  computed: {
    icon(): Component {
      return icons[this.name];
    },
  },
});
</script>
