import strawberry

from .models import Org, Tutor


@strawberry.type
class TutorType:
    id: strawberry.ID
    name: str
    bio: str
    profile_picture: str
    email: str

    @strawberry.field
    def org(self) -> "OrgType":
        return self.org


@strawberry.type
class OrgType:
    id: strawberry.ID
    name: str
    description: str
    logo: str
    website: str | None

    @strawberry.field
    def tutors(self) -> list[TutorType]:
        return list(self.tutors.all())


@strawberry.type
class DashboardQuery:
    @strawberry.field
    def orgs(self) -> list[OrgType]:
        return list(Org.objects.prefetch_related("tutors").order_by("name"))

    @strawberry.field
    def tutors(self) -> list[TutorType]:
        return list(Tutor.objects.select_related("org").order_by("name"))


@strawberry.type
class DashboardMutation:
    @strawberry.mutation
    def create_org(
        self,
        name: str,
        description: str | None = None,
        logo: str = "",
        website: str | None = None,
    ) -> OrgType:
        return Org.objects.create(
            name=name,
            description=description,
            logo=logo,
            website=website,
        )

    @strawberry.mutation
    def update_org(
        self,
        id: strawberry.ID,
        name: str | None = None,
        description: str | None = None,
        logo: str | None = None,
        website: str | None = None,
    ) -> OrgType:
        org = Org.objects.get(pk=id)
        if name is not None:
            org.name = name
        if description is not None:
            org.description = description
        if logo is not None:
            org.logo = logo
        if website is not None:
            org.website = website
        org.save()
        return org

    @strawberry.mutation
    def delete_org(self, id: strawberry.ID) -> bool:
        deleted, _ = Org.objects.filter(pk=id).delete()
        return deleted > 0

    @strawberry.mutation
    def create_tutor(
        self,
        name: str,
        email: str,
        org_id: strawberry.ID,
        bio: str | None = None,
        profile_picture: str = "",
    ) -> TutorType:
        return Tutor.objects.create(
            name=name,
            email=email,
            org_id=org_id,
            bio=bio,
            profile_picture=profile_picture,
        )

    @strawberry.mutation
    def update_tutor(
        self,
        id: strawberry.ID,
        name: str | None = None,
        email: str | None = None,
        org_id: strawberry.ID | None = None,
        bio: str | None = None,
        profile_picture: str | None = None,
    ) -> TutorType:
        tutor = Tutor.objects.get(pk=id)
        if name is not None:
            tutor.name = name
        if email is not None:
            tutor.email = email
        if org_id is not None:
            tutor.org_id = org_id
        if bio is not None:
            tutor.bio = bio
        if profile_picture is not None:
            tutor.profile_picture = profile_picture
        tutor.save()
        return tutor

    @strawberry.mutation
    def delete_tutor(self, id: strawberry.ID) -> bool:
        deleted, _ = Tutor.objects.filter(pk=id).delete()
        return deleted > 0
