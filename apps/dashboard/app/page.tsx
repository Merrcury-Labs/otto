"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  BookOpen,
  Users,
  TrendUp,
  Clock,
  Trophy,
  Target,
  FileText,
  CheckCircle,
  Circle,
  Plus,
  Eye,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";

export default function Dashboard() {
  const stats = [
    {
      title: "Total Courses",
      value: "24",
      change: "+3 this month",
      icon: BookOpen,
      trend: "up",
    },
    {
      title: "Published Courses",
      value: "18",
      change: "+2 this month",
      icon: CheckCircle,
      trend: "up",
    },
    {
      title: "Draft Courses",
      value: "6",
      change: "+1 this month",
      icon: Circle,
      trend: "up",
    },
    {
      title: "Total Quizzes",
      value: "156",
      change: "+12 this month",
      icon: FileText,
      trend: "up",
    },
    {
      title: "Active Students",
      value: "1,234",
      change: "+89 this month",
      icon: Users,
      trend: "up",
    },
    {
      title: "Learning Hours",
      value: "48h",
      change: "+6h this week",
      icon: Clock,
      trend: "up",
    },
  ];

  const recentCourses = [
    {
      id: 1,
      title: "React Fundamentals",
      status: "published",
      quizzes: 12,
      students: 234,
      created: "2024-04-25",
      lastUpdated: "2 hours ago",
    },
    {
      id: 2,
      title: "TypeScript Advanced",
      status: "published",
      quizzes: 8,
      students: 156,
      created: "2024-04-24",
      lastUpdated: "1 day ago",
    },
    {
      id: 3,
      title: "Next.js App Router",
      status: "draft",
      quizzes: 5,
      students: 0,
      created: "2024-04-23",
      lastUpdated: "3 days ago",
    },
    {
      id: 4,
      title: "Database Design",
      status: "published",
      quizzes: 15,
      students: 189,
      created: "2024-04-22",
      lastUpdated: "5 days ago",
    },
    {
      id: 5,
      title: "Python for Beginners",
      status: "draft",
      quizzes: 3,
      students: 0,
      created: "2024-04-21",
      lastUpdated: "1 week ago",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "bg-[#1f8a65] text-white",
      draft: "bg-[#c08532] text-white",
      archived: "bg-muted text-muted-foreground",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium pill-shape ${
          variants[status as keyof typeof variants]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6 px-4">
      <div>
        <h1 className="text-3xl font-normal tracking-tight" style={{ color: '#26251e', letterSpacing: '-0.11px' }}>
          Dashboard
        </h1>
        <p className="text-base" style={{ color: 'rgba(38, 37, 30, 0.55)' }}>
          Manage your courses and track your teaching progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="cursor-card hover:cursor-card-hover transition-all duration-200"
            style={{ backgroundColor: '#e6e5e0', borderRadius: '8px' }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle
                className="text-sm font-medium"
                style={{ color: '#26251e', letterSpacing: '-0.11px' }}
              >
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4" style={{ color: 'rgba(38, 37, 30, 0.55)' }} />
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-normal"
                style={{ color: '#26251e', letterSpacing: '-0.11px' }}
              >
                {stat.value}
              </div>
              <p className="text-xs" style={{ color: 'rgba(38, 37, 30, 0.55)' }}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Courses Table */}
      <Card
        className="cursor-card hover:cursor-card-hover transition-all duration-200"
        style={{ backgroundColor: '#e6e5e0', borderRadius: '8px' }}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle
              className="text-xl font-normal"
              style={{ color: '#26251e', letterSpacing: '-0.11px' }}
            >
              Recent Courses
            </CardTitle>
            <CardDescription style={{ color: 'rgba(38, 37, 30, 0.55)' }}>
              Overview of your recently created and updated courses
            </CardDescription>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium cursor-btn-hover focus-warm transition-all duration-150"
            style={{
              backgroundColor: '#ebeae5',
              color: '#26251e',
              borderRadius: '8px',
              letterSpacing: 'normal',
            }}
          >
            <Plus className="h-4 w-4" />
            Create Course
          </button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottom: '1px solid rgba(38, 37, 30, 0.1)' }}>
                <TableHead
                  className="font-medium"
                  style={{ color: '#26251e' }}
                >
                  Course Title
                </TableHead>
                <TableHead
                  className="font-medium"
                  style={{ color: '#26251e' }}
                >
                  Status
                </TableHead>
                <TableHead
                  className="font-medium"
                  style={{ color: '#26251e' }}
                >
                  Quizzes
                </TableHead>
                <TableHead
                  className="font-medium"
                  style={{ color: '#26251e' }}
                >
                  Students
                </TableHead>
                <TableHead
                  className="font-medium"
                  style={{ color: '#26251e' }}
                >
                  Created
                </TableHead>
                <TableHead
                  className="font-medium"
                  style={{ color: '#26251e' }}
                >
                  Last Updated
                </TableHead>
                <TableHead className="text-right font-medium" style={{ color: '#26251e' }}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCourses.map((course) => (
                <TableRow
                  key={course.id}
                  style={{ borderBottom: '1px solid rgba(38, 37, 30, 0.1)' }}
                  className="hover:bg-[#ebeae5] transition-colors duration-150"
                >
                  <TableCell
                    className="font-medium"
                    style={{ color: '#26251e' }}
                  >
                    {course.title}
                  </TableCell>
                  <TableCell>{getStatusBadge(course.status)}</TableCell>
                  <TableCell style={{ color: '#26251e' }}>
                    {course.quizzes}
                  </TableCell>
                  <TableCell style={{ color: '#26251e' }}>
                    {course.students.toLocaleString()}
                  </TableCell>
                  <TableCell style={{ color: '#26251e' }}>
                    {course.created}
                  </TableCell>
                  <TableCell style={{ color: 'rgba(38, 37, 30, 0.55)' }}>
                    {course.lastUpdated}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
                        style={{ color: 'rgba(38, 37, 30, 0.55)' }}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
                        style={{ color: 'rgba(38, 37, 30, 0.55)' }}
                        title="Edit"
                      >
                        <PencilSimple className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1.5 cursor-btn-hover focus-warm transition-all duration-150 rounded-md"
                        style={{ color: 'rgba(38, 37, 30, 0.55)' }}
                        title="Delete"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className="cursor-card hover:cursor-card-hover transition-all duration-200"
          style={{ backgroundColor: '#e6e5e0', borderRadius: '8px' }}
        >
          <CardHeader>
            <CardTitle
              className="text-lg font-normal"
              style={{ color: '#26251e', letterSpacing: '-0.11px' }}
            >
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="flex items-center gap-3 w-full rounded-lg p-4 cursor-btn-hover focus-warm transition-all duration-150 text-left hover:bg-[#ebeae5]">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: '#f7f7f4', color: '#26251e' }}
              >
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium" style={{ color: '#26251e' }}>
                  Create New Course
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'rgba(38, 37, 30, 0.55)' }}
                >
                  Start building a new course
                </div>
              </div>
            </button>
            <button className="flex items-center gap-3 w-full rounded-lg p-4 cursor-btn-hover focus-warm transition-all duration-150 text-left hover:bg-[#ebeae5]">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: '#f7f7f4', color: '#26251e' }}
              >
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium" style={{ color: '#26251e' }}>
                  Create Quiz
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'rgba(38, 37, 30, 0.55)' }}
                >
                  Add quizzes to existing courses
                </div>
              </div>
            </button>
            <button className="flex items-center gap-3 w-full rounded-lg p-4 cursor-btn-hover focus-warm transition-all duration-150 text-left hover:bg-[#ebeae5]">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: '#f7f7f4', color: '#26251e' }}
              >
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium" style={{ color: '#26251e' }}>
                  Manage Students
                </div>
                <div
                  className="text-sm"
                  style={{ color: 'rgba(38, 37, 30, 0.55)' }}
                >
                  View and manage enrolled students
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Course Progress */}
        <Card
          className="cursor-card hover:cursor-card-hover transition-all duration-200"
          style={{ backgroundColor: '#e6e5e0', borderRadius: '8px' }}
        >
          <CardHeader>
            <CardTitle
              className="text-lg font-normal"
              style={{ color: '#26251e', letterSpacing: '-0.11px' }}
            >
              Course Progress
            </CardTitle>
            <CardDescription style={{ color: 'rgba(38, 37, 30, 0.55)' }}>
              Completion rates by course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCourses.slice(0, 4).map((course) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className="text-sm font-medium"
                    style={{ color: '#26251e' }}
                  >
                    {course.title}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: 'rgba(38, 37, 30, 0.55)' }}
                  >
                    {Math.floor(Math.random() * 30 + 70)}% complete
                  </div>
                </div>
                <div
                  className="h-2 w-full rounded-full"
                  style={{ backgroundColor: '#f7f7f4' }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-200"
                    style={{
                      width: `${Math.floor(Math.random() * 30 + 70)}%`,
                      backgroundColor: '#26251e',
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card
          className="cursor-card hover:cursor-card-hover transition-all duration-200"
          style={{ backgroundColor: '#e6e5e0', borderRadius: '8px' }}
        >
          <CardHeader>
            <CardTitle
              className="text-lg font-normal"
              style={{ color: '#26251e', letterSpacing: '-0.11px' }}
            >
              Weekly Activity
            </CardTitle>
            <CardDescription style={{ color: 'rgba(38, 37, 30, 0.55)' }}>
              Student engagement this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, index) => {
                  const heights = [40, 65, 45, 80, 55, 70, 60];
                  return (
                    <div
                      key={day}
                      className="flex flex-col items-center gap-2 flex-1"
                    >
                      <div
                        className="w-full rounded-t-lg transition-all duration-200 hover:opacity-80"
                        style={{
                          height: `${heights[index]}%`,
                          backgroundColor: 'rgba(38, 37, 30, 0.2)',
                        }}
                      />
                      <div
                        className="text-xs"
                        style={{ color: 'rgba(38, 37, 30, 0.55)' }}
                      >
                        {day}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
