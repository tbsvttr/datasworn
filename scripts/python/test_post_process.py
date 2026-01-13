"""Tests for the post-processing script."""

import pytest
from post_process_models import (
    remove_empty_classes,
    replace_placeholder_types,
    replace_features_dangers_contextually,
    remove_date_pattern,
    post_process,
)


class TestRemoveEmptyClasses:
    """Tests for remove_empty_classes function."""

    def test_removes_denizens_class(self):
        content = '''class Denizens(BaseModel):
    pass


class SomeOtherClass(BaseModel):
    field: str
'''
        result = remove_empty_classes(content)
        assert "class Denizens(BaseModel):" not in result
        assert "class SomeOtherClass(BaseModel):" in result

    def test_removes_features_class(self):
        content = '''class Features(BaseModel):
    pass


class RealClass(BaseModel):
    pass
'''
        result = remove_empty_classes(content)
        assert "class Features(BaseModel):" not in result

    def test_removes_dangers_class(self):
        content = '''class Dangers(BaseModel):
    pass


'''
        result = remove_empty_classes(content)
        assert "class Dangers(BaseModel):" not in result

    def test_preserves_non_empty_classes(self):
        content = '''class DelveSiteDenizen(BaseModel):
    field_id: str
    name: str
'''
        result = remove_empty_classes(content)
        assert "class DelveSiteDenizen(BaseModel):" in result


class TestReplacePlaceholderTypes:
    """Tests for replace_placeholder_types function."""

    def test_replaces_list_denizens(self):
        content = "denizens: list[Denizens]"
        result = replace_placeholder_types(content)
        assert result == "denizens: list[DelveSiteDenizen]"

    def test_replaces_plain_denizens(self):
        content = "denizens: Denizens"
        result = replace_placeholder_types(content)
        assert result == "denizens: list[DelveSiteDenizen]"

    def test_replaces_annotated_denizens(self):
        content = '''Annotated[
        Denizens,'''
        result = replace_placeholder_types(content)
        assert "list[DelveSiteDenizen]" in result


class TestReplaceFeaturesContextually:
    """Tests for replace_features_dangers_contextually function."""

    def test_replaces_domain_features(self):
        content = '''class DelveSiteDomain(BaseModel):
    field_id: str
    features: Features
    dangers: Dangers
'''
        result = replace_features_dangers_contextually(content)
        assert "features: list[DelveSiteDomainFeature]" in result
        assert "dangers: list[DelveSiteDomainDanger]" in result

    def test_replaces_theme_features(self):
        content = '''class DelveSiteTheme(BaseModel):
    field_id: str
    features: Features
    dangers: Dangers
'''
        result = replace_features_dangers_contextually(content)
        assert "features: list[DelveSiteThemeFeature]" in result
        assert "dangers: list[DelveSiteThemeDanger]" in result

    def test_domain_and_theme_get_different_types(self):
        content = '''class DelveSiteDomain(BaseModel):
    features: Features
    dangers: Dangers

class DelveSiteTheme(BaseModel):
    features: Features
    dangers: Dangers
'''
        result = replace_features_dangers_contextually(content)
        # Domain should use Domain types
        assert "DelveSiteDomainFeature" in result
        assert "DelveSiteDomainDanger" in result
        # Theme should use Theme types
        assert "DelveSiteThemeFeature" in result
        assert "DelveSiteThemeDanger" in result


class TestRemoveDatePattern:
    """Tests for remove_date_pattern function."""

    def test_removes_pattern_from_date_field(self):
        content = '''    date: Annotated[
        date_aliased,
        Field(
            description="The date description.",
            pattern='[0-9]{4}-((0[0-9])|(1[0-2]))-(([0-2][0-9])|(3[0-1]))',
        ),
    ]'''
        result = remove_date_pattern(content)
        assert "pattern=" not in result
        assert "description=" in result

    def test_preserves_non_date_patterns(self):
        content = '''    id: Annotated[
        str,
        Field(
            pattern='^[a-z]+$',
        ),
    ]'''
        result = remove_date_pattern(content)
        assert "pattern='^[a-z]+$'" in result


class TestPostProcess:
    """Integration tests for the full post_process function."""

    def test_full_pipeline(self):
        content = '''class Denizens(BaseModel):
    pass


class Features(BaseModel):
    pass


class Dangers(BaseModel):
    pass


class DelveSiteDomain(BaseModel):
    features: Features
    dangers: Dangers

class DelveSiteTheme(BaseModel):
    features: Features
    dangers: Dangers

class SourceInfo(BaseModel):
    date: Annotated[
        date_aliased,
        Field(
            description="The date.",
            pattern='[0-9]{4}-((0[0-9])|(1[0-2]))-(([0-2][0-9])|(3[0-1]))',
        ),
    ]
'''
        result = post_process(content)

        # Empty classes removed
        assert "class Denizens(BaseModel):\n    pass" not in result
        assert "class Features(BaseModel):\n    pass" not in result
        assert "class Dangers(BaseModel):\n    pass" not in result

        # Types replaced correctly
        assert "DelveSiteDomainFeature" in result
        assert "DelveSiteDomainDanger" in result
        assert "DelveSiteThemeFeature" in result
        assert "DelveSiteThemeDanger" in result

        # Date pattern removed
        assert "pattern='[0-9]" not in result
